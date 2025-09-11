const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const PlanningController = require('../controllers/planningController');
const AssignmentController = require('../controllers/assignmentController');
const AbsenceController = require('../controllers/absenceController');

function createRoutes(planningService, assignmentService, memberService, absenceService, auditService) {
  const router = express.Router();
  const path = require('path');
  
  console.log('Creating routes - services check:', {
    planningService: !!planningService,
    assignmentService: !!assignmentService,
    memberService: !!memberService,
    absenceService: !!absenceService,
    auditService: !!auditService
  });
  
  // Initialize controllers
  console.log('Initializing controllers...');
  const planningController = new PlanningController(planningService, auditService);
  console.log('PlanningController created');
  const assignmentController = new AssignmentController(assignmentService, memberService, auditService);
  console.log('AssignmentController created');
  const absenceController = new AbsenceController(absenceService, auditService);
  console.log('AbsenceController created');

  
  // API routes
  console.log('Registering API routes...');
  router.post('/api/members', asyncHandler(assignmentController.addMember.bind(assignmentController)));
  router.get('/api/members', asyncHandler(assignmentController.getMembers.bind(assignmentController)));
  router.get('/api/assignment-data', asyncHandler(assignmentController.getAssignmentData.bind(assignmentController)));
  console.log('Basic API routes registered');
  router.get('/api/specific-assignments', asyncHandler(planningController.getSpecificAssignments.bind(planningController)));
  router.post('/api/specific-assignments', asyncHandler(planningController.createSpecificAssignment.bind(planningController)));
  router.delete('/api/specific-assignments/:id', asyncHandler(planningController.deleteSpecificAssignment.bind(planningController)));
  
  // New API routes for Svelte app
  router.post('/api/assignments', asyncHandler(assignmentController.createAssignment.bind(assignmentController)));
  router.delete('/api/assignments/:id', asyncHandler(assignmentController.deleteAssignment.bind(assignmentController)));

  // Absence API routes (all slot-aware now)
  router.get('/api/absences', asyncHandler(absenceController.getAbsences.bind(absenceController)));
  router.post('/api/absences', asyncHandler(absenceController.createAbsence.bind(absenceController)));
  router.delete('/api/absences/:id', asyncHandler(absenceController.deleteAbsence.bind(absenceController)));
  router.get('/api/absences/date-range', asyncHandler(absenceController.getAbsencesForDateRange.bind(absenceController)));
  router.get('/api/absences/date/:date', asyncHandler(absenceController.getAbsentMembersForDate.bind(absenceController)));
  router.get('/api/absences/check/:memberId/:date/:slot', asyncHandler(absenceController.checkMemberAbsentForSlot.bind(absenceController)));

  // Audit logs API routes
  router.get('/api/audit-logs', asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const logs = await auditService.getAuditLogs(limit, offset);
    res.json(logs);
  }));

  router.get('/api/audit-logs/entity/:entityType/:entityId', asyncHandler(async (req, res) => {
    const { entityType, entityId } = req.params;
    const logs = await auditService.getAuditLogsByEntity(entityType, parseInt(entityId));
    res.json(logs);
  }));

  console.log('All API routes registered. Adding catch-all route for SPA...');
  
  // Serve Svelte app for all non-API routes (this must be LAST)
  router.get('*', (req, res) => {
    console.log('Serving SPA for route:', req.path);
    res.sendFile(path.join(__dirname, '..', 'public', 'dist', 'index.html'));
  });

  console.log('Routes registration complete');
  return router;
}

module.exports = createRoutes;