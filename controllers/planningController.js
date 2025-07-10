const { asyncHandler } = require('../middleware/errorHandler');

class PlanningController {
  constructor(planningService) {
    this.planningService = planningService;
  }

  // GET /planning
  async getPlanning(req, res, next) {
    try {
      console.log('PlanningController.getPlanning called');
      console.log('this.planningService:', !!this.planningService);
      
      const data = await this.planningService.getWeeklyPlanningData();
      console.log('Data keys:', Object.keys(data));
      
      const renderData = {
        ...data,
        title: 'Planning Hebdomadaire',
        pageTitle: 'Planning Hebdomadaire de l\'Association',
        subtitle: `Semaine du ${new Date(data.weekDates[0]).toLocaleDateString('fr-FR')}`,
        currentPage: 'planning',
        pageScript: 'planning.js'
      };
      
      console.log('Render data keys:', Object.keys(renderData));
      
      res.render('planning', renderData);
    } catch (error) {
      console.error('Error in getPlanning:', error);
      next(error);
    }
  }


  // GET /api/specific-assignments
  async getSpecificAssignments(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({ error: 'start_date and end_date are required' });
      }
      
      const assignments = await this.planningService.getSpecificAssignments(start_date, end_date);
      
      res.json(assignments);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/specific-assignments
  async createSpecificAssignment(req, res, next) {
    try {
      const { member_id, date, slot_type } = req.body;
      
      if (!member_id || !date || !slot_type) {
        return res.status(400).json({ error: 'member_id, date, and slot_type are required' });
      }
      
      await this.planningService.createSpecificAssignment(member_id, date, slot_type);
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/specific-assignments/:id
  async deleteSpecificAssignment(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'Assignment ID is required' });
      }
      
      await this.planningService.deleteSpecificAssignment(id);
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

}

module.exports = PlanningController;