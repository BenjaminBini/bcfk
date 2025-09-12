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
  }

  async initialize() {
    await this.setupServices();
    this.setupRoutes();
    this.setupErrorHandling();
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