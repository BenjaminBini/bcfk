const { asyncHandler } = require('../middleware/errorHandler');

class PlanningController {
  constructor(planningService, auditService = null) {
    this.planningService = planningService;
    this.auditService = auditService;
  }

  // GET /planning
  async getPlanning(req, res, next) {
    try {
      console.log("PlanningController.getPlanning called");
      console.log("this.planningService:", !!this.planningService);

      const data = await this.planningService.getWeeklyPlanningData();
      console.log("Data keys:", Object.keys(data));

      const renderData = {
        ...data,
        title: "Planning Hebdomadaire",
        pageTitle: "Planning Hebdomadaire de l'Association",
        subtitle: `Semaine du ${new Date(data.weekDates[0]).toLocaleDateString(
          "fr-FR"
        )}`,
        currentPage: "planning",
        pageScript: "planning.js",
      };

      console.log("Render data keys:", Object.keys(renderData));

      res.render("planning", renderData);
    } catch (error) {
      console.error("Error in getPlanning:", error);
      next(error);
    }
  }

  // GET /api/specific-assignments
  async getSpecificAssignments(req, res, next) {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res
          .status(400)
          .json({ error: "start_date and end_date are required" });
      }

      const assignments = await this.planningService.getSpecificAssignments(
        start_date,
        end_date
      );

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
        return res
          .status(400)
          .json({ error: "member_id, date, and slot_type are required" });
      }

      const result = await this.planningService.createSpecificAssignment(
        member_id,
        date,
        slot_type
      );

      // Log the creation action
      if (this.auditService && result && result.id) {
        const userInfo = this.auditService.extractUserInfo(req);
        const rollbackData = this.auditService.generateRollbackData(
          "CREATE",
          "specific_assignment",
          null,
          result
        );
        
        // Get complete assignment data with member info for audit log
        const completeAssignmentData = await this.auditService.getEntityData("specific_assignment", result.id);
        
        await this.auditService.logAction(
          "CREATE",
          "specific_assignment",
          result.id,
          null, // no old data for creation
          completeAssignmentData || result,
          userInfo,
          rollbackData
        );
      }

      res.json({ success: true, assignment: result });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/specific-assignments/:id
  async deleteSpecificAssignment(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Assignment ID is required" });
      }

      // Get existing data before deletion for audit log
      let oldData = null;
      if (this.auditService) {
        oldData = await this.auditService.getEntityData(
          "specific_assignment",
          parseInt(id)
        );
      }

      await this.planningService.deleteSpecificAssignment(id);

      // Log the deletion action
      if (this.auditService && oldData) {
        const userInfo = this.auditService.extractUserInfo(req);
        const rollbackData = this.auditService.generateRollbackData(
          "DELETE",
          "specific_assignment",
          oldData,
          null
        );

        await this.auditService.logAction(
          "DELETE",
          "specific_assignment",
          parseInt(id),
          oldData,
          null, // no new data for deletion
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

module.exports = PlanningController;