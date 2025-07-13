const Database = require('./database.js');

// Script to import recurring assignments from Google Sheet "Attributions créneaux"
// Based on the pattern seen: Type, Jour, Membres habituels

async function importRecurringAssignments() {
  const db = new Database();
  
  // First, get all members with their IDs for reference
  const members = await new Promise((resolve, reject) => {
    db.getAllMembers((err, members) => {
      if (err) reject(err);
      else resolve(members);
    });
  });
  
  // Create a mapping from first names to member IDs
  const membersByFirstName = {};
  members.forEach(member => {
    const firstName = member.first_name.toLowerCase();
    membersByFirstName[firstName] = member.id;
  });
  
  console.log('Available members:', Object.keys(membersByFirstName));
  
  // Define weekday mapping (French to numbers)
  const weekdays = {
    'lundi': 0,
    'mardi': 1,
    'mercredi': 2,
    'jeudi': 3,
    'vendredi': 4,
    'samedi': 5,
    'dimanche': 6
  };
  
  // Define slot type mapping (French to English)
  const slotTypes = {
    'ouverture': 'ouverture',
    'fermeture': 'fermeture'
  };
  
  // Recurring assignments discovered from the Google Sheet
  const assignments = [
    // Monday opening: Bernadette
    {
      type: 'ouverture',
      day: 'lundi',
      members: ['bernadette']
    },
    // Monday closing: Nathalie, Liliana
    {
      type: 'fermeture', 
      day: 'lundi',
      members: ['nathalie', 'liliana']
    },
    // Tuesday opening: Bernadette
    {
      type: 'ouverture',
      day: 'mardi',
      members: ['bernadette']
    },
    // Tuesday closing: Bernadette, Bruno
    {
      type: 'fermeture',
      day: 'mardi', 
      members: ['bernadette', 'bruno']
    },
    // Wednesday opening: Bernadette
    {
      type: 'ouverture',
      day: 'mercredi',
      members: ['bernadette']
    },
    // Wednesday closing: Bernadette, Benjamin, Anne
    {
      type: 'fermeture',
      day: 'mercredi',
      members: ['bernadette', 'benjamin', 'anne']
    },
    // Thursday opening: Bernadette
    {
      type: 'ouverture',
      day: 'jeudi',
      members: ['bernadette']
    },
    // Thursday closing: Carmen, Marie
    {
      type: 'fermeture',
      day: 'jeudi',
      members: ['carmen', 'marie']
    },
    // Friday opening: Bernadette
    {
      type: 'ouverture',
      day: 'vendredi',
      members: ['bernadette']
    },
    // Friday closing: Bernadette
    {
      type: 'fermeture',
      day: 'vendredi',
      members: ['bernadette']
    },
    // Saturday opening: Christian, Marie
    {
      type: 'ouverture',
      day: 'samedi',
      members: ['christian', 'marie']
    },
    // Saturday closing: Caroline, Dominique, Sandrine, Frédérique, Thomas, Adeline
    {
      type: 'fermeture',
      day: 'samedi',
      members: ['caroline', 'dominique', 'sandrine', 'frédérique', 'thomas', 'adeline']
    },
    // Sunday opening: Bernadette
    {
      type: 'ouverture',
      day: 'dimanche',
      members: ['bernadette']
    },
    // Sunday closing: Bernadette, Benjamin
    {
      type: 'fermeture',
      day: 'dimanche',
      members: ['bernadette', 'benjamin']
    }
  ];
  
  console.log(`\nImporting ${assignments.length} recurring assignment groups...`);
  
  for (const assignment of assignments) {
    const weekday = weekdays[assignment.day.toLowerCase()];
    const slotType = slotTypes[assignment.type.toLowerCase()];
    
    if (weekday === undefined || !slotType) {
      console.error(`Invalid day or type: ${assignment.day} ${assignment.type}`);
      continue;
    }
    
    // Get member IDs for this assignment
    const memberIds = [];
    for (const memberName of assignment.members) {
      const memberId = membersByFirstName[memberName.toLowerCase()];
      if (memberId) {
        memberIds.push(memberId);
      } else {
        console.warn(`Member not found: ${memberName}`);
      }
    }
    
    if (memberIds.length === 0) {
      console.warn(`No valid members found for ${assignment.type} ${assignment.day}`);
      continue;
    }
    
    // Import this recurring assignment
    try {
      await new Promise((resolve, reject) => {
        db.setRecurringAssignment(weekday, slotType, memberIds, (err) => {
          if (err) {
            console.error(`Error setting recurring assignment for ${assignment.type} ${assignment.day}:`, err);
            reject(err);
          } else {
            console.log(`✓ Set ${assignment.type} ${assignment.day}: ${assignment.members.join(', ')}`);
            resolve();
          }
        });
      });
    } catch (error) {
      console.error(`Failed to set recurring assignment:`, error);
    }
  }
  
  // Verify all recurring assignments were imported
  console.log('\nAll recurring assignments in database:');
  db.getRecurringAssignments((err, assignments) => {
    if (err) {
      console.error('Error getting recurring assignments:', err);
    } else {
      assignments.forEach(assignment => {
        const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        console.log(`${assignment.slot_type} ${dayNames[assignment.weekday]}: ${assignment.member_name}`);
      });
    }
    db.close();
  });
}

if (require.main === module) {
  importRecurringAssignments().catch(console.error);
}

module.exports = { importRecurringAssignments };