const express = require('express');
const PlanningController = require('../controllers/planningController');
const AssignmentController = require('../controllers/assignmentController');
const AbsenceController = require('../controllers/absenceController');

function createRoutes(planningService, assignmentService, memberService, absenceService) {
  const router = express.Router();
  
  // Initialize controllers
  const planningController = new PlanningController(planningService);
  const assignmentController = new AssignmentController(assignmentService, memberService);
  const absenceController = new AbsenceController(absenceService);

  // Planning routes (legacy)
  router.get('/planning', planningController.getPlanning.bind(planningController));
  
  // API routes
  router.post('/api/members', assignmentController.addMember.bind(assignmentController));
  router.get('/api/members', assignmentController.getMembers.bind(assignmentController));
  router.get('/api/assignment-data', assignmentController.getAssignmentData.bind(assignmentController));
  router.post('/api/assignments/:weekday/:slotType', assignmentController.setDefaultAssignment.bind(assignmentController));
  router.post('/api/weekly-slots/:date/:slotType', planningController.updateWeeklySlot.bind(planningController));
  
  // New API routes for Svelte app
  router.post('/api/assignments', assignmentController.createAssignment.bind(assignmentController));
  router.delete('/api/assignments/:id', assignmentController.deleteAssignment.bind(assignmentController));

  // Absence API routes
  router.get('/api/absences', absenceController.getAbsences.bind(absenceController));
  router.post('/api/absences', absenceController.createAbsence.bind(absenceController));
  router.delete('/api/absences/:id', absenceController.deleteAbsence.bind(absenceController));
  router.get('/api/absences/date-range', absenceController.getAbsencesForDateRange.bind(absenceController));
  router.get('/api/absences/date/:date', absenceController.getAbsentMembersForDate.bind(absenceController));

  return router;
}

module.exports = createRoutes;