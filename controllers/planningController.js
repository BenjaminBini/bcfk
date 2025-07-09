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

  // POST /api/weekly-slots/:date/:slotType
  async updateWeeklySlot(req, res, next) {
    try {
      const { date, slotType } = req.params;
      const { memberIds } = req.body;
      
      if (!Array.isArray(memberIds)) {
        return res.status(400).json({ error: 'memberIds must be an array' });
      }
      
      await this.planningService.updateWeeklySlot(date, slotType, memberIds);
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

}

module.exports = PlanningController;