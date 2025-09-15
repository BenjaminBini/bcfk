const { asyncHandler } = require("../middleware/errorHandler");

class PlanningController {
  constructor(planningService, auditService = null) {
    this.planningService = planningService;
    this.auditService = auditService;
  }

  // GET /api/weekly-schedule - Simple endpoint for weekly schedule data with date range parameters
  async getWeeklySchedule(req, res, next) {
    try {
      const { start, end } = req.query;

      if (!start || !end) {
        return res
          .status(400)
          .json({ error: "start and end date parameters are required" });
      }

      // Validate date range (max 7 days)
      const startDate = new Date(start);
      const endDate = new Date(end);
      const daysDiff =
        Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      if (daysDiff > 7) {
        return res
          .status(400)
          .json({ error: "Date range cannot exceed 7 days" });
      }

      // Get computed schedule data from planning service
      const scheduleData = await this.planningService.getComputedWeeklySchedule(
        start,
        end,
        0 // weekOffset not needed for simple date range query
      );

      res.json(scheduleData);
    } catch (error) {
      console.error("Error in getWeeklySchedule:", error);
      next(error);
    }
  }

  // GET /api/weekly-data/:weekOffset - Unified endpoint for all computed schedule data
  async getUnifiedWeeklyData(req, res, next) {
    try {
      const { weekOffset = 0 } = req.params;
      const offset = parseInt(weekOffset);

      // Calculate date range for 3 weeks (previous, current, next)
      const now = new Date();
      const baseDate = new Date(now);
      baseDate.setDate(now.getDate() + offset * 7);

      // Get start of the week (Monday) for the base week
      const dayOfWeek = baseDate.getDay();
      const startOfBaseWeek = new Date(baseDate);
      startOfBaseWeek.setDate(
        baseDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
      );

      // Calculate dates for 3 weeks (previous week to next week)
      const startDate = new Date(startOfBaseWeek);
      startDate.setDate(startOfBaseWeek.getDate() - 7); // Previous week

      const endDate = new Date(startOfBaseWeek);
      endDate.setDate(startOfBaseWeek.getDate() + 13); // Next week end

      const formatDate = (date) => {
        return (
          date.getFullYear() +
          "-" +
          String(date.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(date.getDate()).padStart(2, "0")
        );
      };

      const startDateStr = formatDate(startDate);
      const endDateStr = formatDate(endDate);

      // Get computed schedule data from planning service
      const scheduleData = await this.planningService.getComputedWeeklySchedule(
        startDateStr,
        endDateStr,
        offset
      );

      res.json(scheduleData);
    } catch (error) {
      console.error("Error in getUnifiedWeeklyData:", error);
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
        const completeAssignmentData = await this.auditService.getEntityData(
          "specific_assignment",
          result.id
        );

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
