const { asyncHandler } = require('../middleware/errorHandler');

class AssignmentController {
  constructor(assignmentService, memberService) {
    this.assignmentService = assignmentService;
    this.memberService = memberService;
  }

  // GET /assignments
  async getAssignments(req, res, next) {
    try {
      const data = await this.assignmentService.getAssignmentData();
      
      res.render('assignments', {
        ...data,
        title: 'Affectations par Défaut',
        pageTitle: 'Gestion des Affectations par Défaut',
        subtitle: 'Configurer les défauts hebdomadaires',
        currentPage: 'assignments',
        pageScript: 'assignments.js'
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/members
  async addMember(req, res, next) {
    try {
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }
      
      const member = await this.memberService.addMemberFromFullName(name);
      res.json(member);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/assignments/:weekday/:slotType
  async setDefaultAssignment(req, res, next) {
    try {
      const { weekday, slotType } = req.params;
      const { memberIds } = req.body;
      
      // Validate the assignment
      const validation = this.assignmentService.validateAssignment(
        parseInt(weekday), 
        slotType, 
        memberIds
      );
      
      await this.assignmentService.setDefaultAssignment(
        parseInt(weekday), 
        slotType, 
        memberIds
      );
      
      res.json({ 
        success: true, 
        warnings: validation.warnings || []
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/members
  async getMembers(req, res, next) {
    try {
      const members = await this.memberService.getAllMembers();
      res.json(members);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/assignment-data
  async getAssignmentData(req, res, next) {
    try {
      const data = await this.assignmentService.getAssignmentData();
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/assignments
  async createAssignment(req, res, next) {
    try {
      const { weekday, slot_type, member_id } = req.body;
      
      if (weekday === undefined || !slot_type || !member_id) {
        return res.status(400).json({ error: 'weekday, slot_type, and member_id are required' });
      }
      
      const assignment = await this.assignmentService.createAssignment(weekday, slot_type, member_id);
      res.json(assignment);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/assignments/:id
  async deleteAssignment(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'Assignment ID is required' });
      }
      
      await this.assignmentService.deleteAssignment(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AssignmentController;