const express = require('express');
const path = require('path');
const config = require('./config');
const Database = require('./database');
const MemberService = require('./services/memberService');
const PlanningService = require('./services/planningService');
const AssignmentService = require('./services/assignmentService');
const AbsenceService = require('./services/absenceService');
const AuditService = require('./services/auditService');
const createRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

class App {
  constructor() {
    this.app = express();
    this.db = new Database();
    this.setupMiddleware();
    this.setupErrorHandling();
  }

  async initialize() {
    await this.setupServices();
    this.setupRoutes();
  }

  async setupServices() {
    console.log('Setting up services...');
    this.auditService = new AuditService(this.db);
    console.log('AuditService created');
    this.memberService = new MemberService(this.db);
    console.log('MemberService created');
    this.planningService = new PlanningService(this.db, this.memberService);
    console.log('PlanningService created');
    this.assignmentService = new AssignmentService(this.db, this.memberService);
    console.log('AssignmentService created');
    this.absenceService = new AbsenceService(this.db);
    console.log('AbsenceService created');
    
    // Consolidate absence periods on startup to ensure data consistency
    await this.consolidateAbsencePeriods();
  }

  async consolidateAbsencePeriods() {
    console.log('🔧 Consolidating absence periods on startup...');
    try {
      const allAbsences = await this.absenceService.getAllAbsences();
      const memberIds = [...new Set(allAbsences.map(a => a.member_id))];
      
      let totalConsolidated = 0;
      
      for (const memberId of memberIds) {
        const memberAbsences = allAbsences.filter(a => a.member_id === memberId);
        if (memberAbsences.length <= 1) continue;
        
        // Sort absences by start date
        memberAbsences.sort((a, b) => a.start_date.localeCompare(b.start_date));
        
        const consolidated = [];
        let currentPeriod = { ...memberAbsences[0] };
        
        for (let i = 1; i < memberAbsences.length; i++) {
          const nextAbsence = memberAbsences[i];
          
          if (this.absenceService.isOverlappingOrAdjacent(
            currentPeriod.start_date, 
            currentPeriod.end_date, 
            currentPeriod.start_slot, 
            currentPeriod.end_slot,
            nextAbsence.start_date, 
            nextAbsence.end_date, 
            nextAbsence.start_slot, 
            nextAbsence.end_slot
          )) {
            // Merge with current period
            const merged = this.absenceService.mergePeriods(currentPeriod, nextAbsence);
            currentPeriod = merged;
          } else {
            // No overlap, save current period and start a new one
            consolidated.push(currentPeriod);
            currentPeriod = { ...nextAbsence };
          }
        }
        
        // Add the last period
        consolidated.push(currentPeriod);
        
        // If we consolidated periods, update the database
        if (consolidated.length < memberAbsences.length) {
          // Delete all existing absences for this member
          for (const absence of memberAbsences) {
            await this.absenceService.deleteAbsence(absence.id);
          }
          
          // Create new consolidated absences
          for (const period of consolidated) {
            await this.absenceService.addAbsence(
              memberId,
              period.start_date,
              period.end_date,
              period.start_slot,
              period.end_slot
            );
          }
          
          const savedPeriods = memberAbsences.length - consolidated.length;
          totalConsolidated += savedPeriods;
          console.log(`   📊 Member ${memberId}: ${memberAbsences.length} → ${consolidated.length} periods (saved ${savedPeriods})`);
        }
      }
      
      if (totalConsolidated > 0) {
        console.log(`✅ Consolidated ${totalConsolidated} overlapping absence periods`);
      } else {
        console.log('✅ No overlapping absence periods found');
      }
    } catch (error) {
      console.error('❌ Error consolidating absence periods:', error.message);
      // Don't crash the app if consolidation fails
    }
  }

  setupMiddleware() {
    // Body parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Static files
    this.app.use(express.static(path.join(__dirname, config.app.staticDir)));
    
    // View engine
    this.app.set('view engine', config.app.viewEngine);
    this.app.set('views', path.join(__dirname, 'views'));
    
    // Request logging in development
    if (config.app.environment === 'development') {
      this.app.use((req, _res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
      });
    }
  }

  setupRoutes() {
    console.log('Setting up routes...');
    console.log('Services available:', {
      planningService: !!this.planningService,
      assignmentService: !!this.assignmentService,
      memberService: !!this.memberService
    });
    
    const routes = createRoutes(
      this.planningService,
      this.assignmentService,
      this.memberService,
      this.absenceService,
      this.auditService
    );
    this.app.use('/', routes);
    console.log('Routes setup complete');
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  async start() {
    await this.initialize();
    
    const { port, host } = config.server;
    
    this.app.listen(port, host, () => {
      console.log(`🚀 Server running on http://${host}:${port}`);
      console.log(`📱 Environment: ${config.app.environment}`);
      console.log(`🎨 Theme: ${config.ui.theme}`);
    });
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = App;