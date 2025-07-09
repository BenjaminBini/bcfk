const { asyncHandler } = require('../middleware/errorHandler');

class AbsenceController {
  constructor(absenceService) {
    this.absenceService = absenceService;
  }

  // GET /api/absences
  async getAbsences(req, res, next) {
    try {
      const absences = await this.absenceService.getAbsences();
      res.json(absences);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/absences
  async createAbsence(req, res, next) {
    try {
      const { member_id, start_date, end_date } = req.body;
      
      if (!member_id || !start_date || !end_date) {
        return res.status(400).json({ 
          error: 'member_id, start_date, and end_date are required' 
        });
      }
      
      const absence = await this.absenceService.createAbsence(member_id, start_date, end_date);
      res.json(absence);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/absences/:id
  async deleteAbsence(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'Absence ID is required' });
      }
      
      await this.absenceService.removeAbsence(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/absences/date-range?start=YYYY-MM-DD&end=YYYY-MM-DD
  async getAbsencesForDateRange(req, res, next) {
    try {
      const { start, end } = req.query;
      
      if (!start || !end) {
        return res.status(400).json({ 
          error: 'start and end date query parameters are required' 
        });
      }
      
      const absences = await this.absenceService.getAbsencesForWeek(start, end);
      res.json(absences);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/absences/date/:date
  async getAbsentMembersForDate(req, res, next) {
    try {
      const { date } = req.params;
      
      if (!date) {
        return res.status(400).json({ error: 'Date is required' });
      }
      
      const absentMembers = await this.absenceService.getAbsentMembersForDate(date);
      res.json(absentMembers);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AbsenceController;