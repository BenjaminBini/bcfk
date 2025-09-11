const express = require('express');
const PlanningController = require('../controllers/planningController');
const AssignmentController = require('../controllers/assignmentController');
const AbsenceController = require('../controllers/absenceController');

function createRoutes(planningService, assignmentService, memberService, absenceService, auditService) {
  const router = express.Router();
  const path = require('path');
  
  // Initialize controllers
  const planningController = new PlanningController(planningService, auditService);
  const assignmentController = new AssignmentController(assignmentService, memberService, auditService);
  const absenceController = new AbsenceController(absenceService, auditService);

  
  // API routes
  router.post('/api/members', assignmentController.addMember.bind(assignmentController));
  router.get('/api/members', assignmentController.getMembers.bind(assignmentController));
  router.get('/api/assignment-data', assignmentController.getAssignmentData.bind(assignmentController));
  router.get('/api/specific-assignments', planningController.getSpecificAssignments.bind(planningController));
  router.post('/api/specific-assignments', planningController.createSpecificAssignment.bind(planningController));
  router.delete('/api/specific-assignments/:id', planningController.deleteSpecificAssignment.bind(planningController));
  
  // New API routes for Svelte app
  router.post('/api/assignments', assignmentController.createAssignment.bind(assignmentController));
  router.delete('/api/assignments/:id', assignmentController.deleteAssignment.bind(assignmentController));

  // Absence API routes (all slot-aware now)
  router.get('/api/absences', absenceController.getAbsences.bind(absenceController));
  router.post('/api/absences', absenceController.createAbsence.bind(absenceController));
  router.delete('/api/absences/:id', absenceController.deleteAbsence.bind(absenceController));
  router.get('/api/absences/date-range', absenceController.getAbsencesForDateRange.bind(absenceController));
  router.get('/api/absences/date/:date', absenceController.getAbsentMembersForDate.bind(absenceController));
  router.get('/api/absences/check/:memberId/:date/:slot', absenceController.checkMemberAbsentForSlot.bind(absenceController));

  // Audit logs API routes
  router.get('/api/audit-logs', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;
      const logs = await auditService.getAuditLogs(limit, offset);
      res.json(logs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  });

  router.get('/api/audit-logs/entity/:entityType/:entityId', async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const logs = await auditService.getAuditLogsByEntity(entityType, parseInt(entityId));
      res.json(logs);
    } catch (error) {
      console.error('Error fetching entity audit logs:', error);
      res.status(500).json({ error: 'Failed to fetch entity audit logs' });
    }
  });

  // Serve Svelte app for all non-API routes
  router.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'dist', 'index.html'));
  });

  return router;
}

module.exports = createRoutes;