const config = require('../config');

class PlanningService {
  constructor(database, memberService) {
    this.db = database;
    this.memberService = memberService;
  }

  getCurrentWeekDates() {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  }

  async getWeeklySlots(startDate, endDate) {
    return new Promise((resolve, reject) => {
      this.db.getWeeklySlots(startDate, endDate, (err, slots) => {
        if (err) reject(err);
        else resolve(slots);
      });
    });
  }

  async generateWeeklySlots(startDate) {
    return new Promise((resolve, reject) => {
      this.db.generateWeeklySlots(startDate, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async getWeeklyPlanningData() {
    try {
      const weekDates = this.getCurrentWeekDates();
      const startDate = weekDates[0];
      const endDate = weekDates[6];
      
      const members = await this.memberService.getMembersWithDisplayNames();
      
      // Only regenerate weekly slots if they don't exist for this week
      const existingSlots = await this.getWeeklySlots(startDate, endDate);
      if (existingSlots.length === 0) {
        await this.generateWeeklySlots(startDate);
      }
      
      const slots = await this.getWeeklySlots(startDate, endDate);
      const slotsWithDisplayNames = this.memberService.applyDisplayNamesToData(slots, members);
      
      return {
        weekDates,
        slots: slotsWithDisplayNames,
        dayNames: config.ui.dayNames
      };
    } catch (error) {
      throw new Error(`Failed to get weekly planning data: ${error.message}`);
    }
  }

  async updateWeeklySlot(date, slotType, memberIds) {
    return new Promise((resolve, reject) => {
      this.db.updateWeeklySlot(date, slotType, memberIds, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = PlanningService;