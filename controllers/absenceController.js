const { asyncHandler } = require('../middleware/errorHandler');

class AbsenceController {
  constructor(absenceService, auditService = null) {
    this.absenceService = absenceService;
    this.auditService = auditService;
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
      const { member_id, start_date, end_date, start_slot = 'ouverture', end_slot = 'fermeture' } = req.body;
      
      if (!member_id || !start_date || !end_date) {
        return res.status(400).json({ 
          error: 'member_id, start_date, and end_date are required' 
        });
      }
      
      const absence = await this.absenceService.createAbsence(member_id, start_date, end_date, start_slot, end_slot);
      
      // Log the creation action
      if (this.auditService && absence && absence.id) {
        const userInfo = this.auditService.extractUserInfo(req);
        const rollbackData = this.auditService.generateRollbackData('CREATE', 'absence', null, absence);
        
        // Get complete absence data with member info for audit log
        const completeAbsenceData = await this.auditService.getEntityData('absence', absence.id);
        
        await this.auditService.logAction(
          'CREATE',
          'absence',
          absence.id,
          null,
          completeAbsenceData || absence,
          userInfo,
          rollbackData
        );
      }
      
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
      
      // Get existing data before deletion for audit log
      let oldData = null;
      if (this.auditService) {
        oldData = await this.auditService.getEntityData('absence', parseInt(id));
      }
      
      await this.absenceService.removeAbsence(parseInt(id));
      
      // Log the deletion action
      if (this.auditService && oldData) {
        const userInfo = this.auditService.extractUserInfo(req);
        const rollbackData = this.auditService.generateRollbackData('DELETE', 'absence', oldData, null);
        
        await this.auditService.logAction(
          'DELETE',
          'absence',
          parseInt(id),
          oldData,
          null,
          userInfo,
          rollbackData
        );
      }
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

}

module.exports = AbsenceController;