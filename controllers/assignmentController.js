const { asyncHandler } = require('../middleware/errorHandler');

class AssignmentController {
  constructor(assignmentService, memberService, auditService = null) {
    this.assignmentService = assignmentService;
    this.memberService = memberService;
    this.auditService = auditService;
  }

  // GET /assignments
  async getAssignments(req, res, next) {
    try {
      const data = await this.assignmentService.getAssignmentData();
      
      res.render("assignments", {
        ...data,
        title: "Affectations hebdomadaires",
        pageTitle: "Affectations hebdomadaires",
        subtitle: "Configurer les affectations hebdomadaires",
        currentPage: "assignments",
        pageScript: "assignments.js",
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
      
      // Log the creation action
      if (this.auditService && member && member.id) {
        const userInfo = this.auditService.extractUserInfo(req);
        const rollbackData = this.auditService.generateRollbackData('CREATE', 'member', null, member);
        
        // Get complete member data for audit log (members don't need joins, but for consistency)
        const completeMemberData = await this.auditService.getEntityData('member', member.id);
        
        await this.auditService.logAction(
          'CREATE',
          'member',
          member.id,
          null,
          completeMemberData || member,
          userInfo,
          rollbackData
        );
      }
      
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
      
      await this.assignmentService.setRecurringAssignment(
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

  // GET /api/members/:id
  async getMemberById(req, res, next) {
    try {
      const { id } = req.params;
      const member = await this.memberService.getMemberById(parseInt(id));

      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }

      res.json(member);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/members/:id
  async updateMember(req, res, next) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      // Get old data before update for audit log
      let oldData = null;
      if (this.auditService) {
        oldData = await this.auditService.getEntityData('member', parseInt(id));
      }

      const member = await this.memberService.updateMemberFromFullName(parseInt(id), name);

      // Log the update action
      if (this.auditService && oldData) {
        const userInfo = this.auditService.extractUserInfo(req);
        const completeMemberData = await this.auditService.getEntityData('member', parseInt(id));
        const rollbackData = this.auditService.generateRollbackData('UPDATE', 'member', oldData, completeMemberData);

        await this.auditService.logAction(
          'UPDATE',
          'member',
          parseInt(id),
          oldData,
          completeMemberData || member,
          userInfo,
          rollbackData
        );
      }

      res.json(member);
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
      
      const assignment = await this.assignmentService.createRecurringAssignment(weekday, slot_type, member_id);
      
      // Log the creation action
      if (this.auditService && assignment && assignment.id) {
        const userInfo = this.auditService.extractUserInfo(req);
        const rollbackData = this.auditService.generateRollbackData('CREATE', 'recurring_assignment', null, assignment);
        
        // Get complete assignment data with member info for audit log
        const completeAssignmentData = await this.auditService.getEntityData('recurring_assignment', assignment.id);
        
        await this.auditService.logAction(
          'CREATE',
          'recurring_assignment',
          assignment.id,
          null,
          completeAssignmentData || assignment,
          userInfo,
          rollbackData
        );
      }
      
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
      
      // Get existing data before deletion for audit log
      let oldData = null;
      if (this.auditService) {
        oldData = await this.auditService.getEntityData('recurring_assignment', parseInt(id));
      }
      
      await this.assignmentService.deleteRecurringAssignment(parseInt(id));
      
      // Log the deletion action
      if (this.auditService && oldData) {
        const userInfo = this.auditService.extractUserInfo(req);
        const rollbackData = this.auditService.generateRollbackData('DELETE', 'recurring_assignment', oldData, null);
        
        await this.auditService.logAction(
          'DELETE',
          'recurring_assignment',
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

  // POST /api/assignments/:weekday/:slotType
  async updateAssignments(req, res, next) {
    try {
      const { weekday, slotType } = req.params;
      const { memberIds } = req.body;
      
      if (weekday === undefined || !slotType || !Array.isArray(memberIds)) {
        return res.status(400).json({ error: 'weekday, slotType, and memberIds array are required' });
      }
      
      // Validate the assignment
      const validation = this.assignmentService.validateAssignment(
        parseInt(weekday), 
        slotType, 
        memberIds
      );
      
      await this.assignmentService.setRecurringAssignment(
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
}

module.exports = AssignmentController;