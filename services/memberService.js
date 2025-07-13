const { generateDisplayNames, applyDisplayNames } = require('../scripts/data/utils');

class MemberService {
  constructor(database) {
    this.db = database;
  }

  async getAllMembers() {
    return new Promise((resolve, reject) => {
      this.db.getAllMembers((err, members) => {
        if (err) reject(err);
        else resolve(members);
      });
    });
  }

  async getMembersWithDisplayNames() {
    try {
      const members = await this.getAllMembers();
      return generateDisplayNames(members);
    } catch (error) {
      throw new Error(`Failed to get members with display names: ${error.message}`);
    }
  }

  async addMember(firstName, lastName = '') {
    return new Promise((resolve, reject) => {
      this.db.addMember(firstName, lastName, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, first_name: firstName, last_name: lastName });
      });
    });
  }

  async addMemberFromFullName(fullName) {
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    return this.addMember(firstName, lastName);
  }

  applyDisplayNamesToData(data, members, memberIdField = 'member_id', displayField = 'display_name') {
    return applyDisplayNames(data, members, memberIdField, displayField);
  }
}

module.exports = MemberService;