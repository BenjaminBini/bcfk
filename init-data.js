const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

// Members data
const members = [
  { first_name: 'Adeline', name: 'Adeline Jeanneret' },
  { first_name: 'Benjamin', name: 'Benjamin Bini' },
  { first_name: 'Bernadette', name: 'Bernadette Laugner' },
  { first_name: 'Bruno', name: 'Bruno Knaub' },
  { first_name: 'Carmen', name: 'Carmen Koebel' },
  { first_name: 'Caroline', name: 'Caroline Pfaffenhof' },
  { first_name: 'Christian', name: 'Christian Lieber' },
  { first_name: 'Dominique', name: 'Dominique Lesenne' },
  { first_name: 'Frédérique', name: 'Frédérique Marchal' },
  { first_name: 'Josée', name: 'Josée Bechet-Zilliox' },
  { first_name: 'Liliana', name: 'Liliana' },
  { first_name: 'Marie', name: 'Marie' },
  { first_name: 'Nathalie', name: 'Nathalie' },
  { first_name: 'Sandrine', name: 'Sandrine Wantz' },
  { first_name: 'Théo', name: 'Théo Dettmann' },
  { first_name: 'Thomas', name: 'Thomas Lobstein' },
  { first_name: 'Anne', name: 'Anne Rubin' }
];

// Recurring assignments data
const recurringAssignments = [
  { day: 'Lundi', type: 'ouverture', members: ['Bernadette'] },
  { day: 'Lundi', type: 'fermeture', members: ['Nathalie', 'Liliana'] },
  { day: 'Mardi', type: 'ouverture', members: ['Bernadette'] },
  { day: 'Mardi', type: 'fermeture', members: ['Bernadette', 'Bruno'] },
  { day: 'Mercredi', type: 'ouverture', members: ['Bernadette'] },
  { day: 'Mercredi', type: 'fermeture', members: ['Bernadette', 'Benjamin', 'Anne'] },
  { day: 'Jeudi', type: 'ouverture', members: ['Bernadette'] },
  { day: 'Jeudi', type: 'fermeture', members: ['Carmen', 'Marie'] },
  { day: 'Vendredi', type: 'ouverture', members: ['Bernadette'] },
  { day: 'Vendredi', type: 'fermeture', members: ['Bernadette'] },
  { day: 'Samedi', type: 'ouverture', members: ['Christian', 'Marie'] },
  { day: 'Samedi', type: 'fermeture', members: ['Caroline', 'Dominique', 'Sandrine', 'Frédérique', 'Thomas', 'Adeline'] },
  { day: 'dimanche', type: 'ouverture', members: ['Bernadette'] },
  { day: 'dimanche', type: 'fermeture', members: ['Bernadette', 'Benjamin'] }
];

// Absences data
const absences = [
  { name: 'Benjamin', start: '06/07/2025', end: '06/07/2025' },
  { name: 'Anne', start: '09/07/2025', end: '27/07/2025' },
  { name: 'Bernadette', start: '10/07/2025', end: '27/07/2025' },
  { name: 'Frédérique', start: '18/07/2025', end: '21/07/2025' },
  { name: 'Thomas', start: '18/07/2025', end: '21/07/2025' },
  { name: 'Sandrine', start: '22/07/2025', end: '06/08/2025' },
  { name: 'Marie', start: '25/07/2025', end: '22/08/2025' },
  { name: 'Frédérique', start: '04/08/2025', end: '31/08/2025' },
  { name: 'Thomas', start: '04/08/2025', end: '31/08/2025' },
  { name: 'Benjamin', start: '05/08/2025', end: '22/08/2025' },
  { name: 'Carmen', start: '18/08/2025', end: '31/08/2025' },
  { name: 'Bruno', start: '20/07/2025', end: '24/08/2025' },
  { name: 'Nathalie', start: '20/07/2025', end: '24/08/2025' },
  { name: 'Dominique', start: '03/05/2025', end: '05/08/2025' },
  { name: 'Caroline', start: '09/08/2025', end: '24/08/2025' },
  { name: 'Liliana', start: '01/07/2025', end: '31/08/2025' }
];

// Helper functions
function convertDateFormat(dateStr) {
  // Convert from DD/MM/YYYY to YYYY-MM-DD
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function getDayIndex(dayName) {
  const days = {
    'Lundi': 0,
    'Mardi': 1,
    'Mercredi': 2,
    'Jeudi': 3,
    'Vendredi': 4,
    'Samedi': 5,
    'dimanche': 6
  };
  return days[dayName];
}

async function apiCall(method, endpoint, data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API call failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

async function initializeData() {
  console.log('🚀 Starting data initialization...\n');

  try {
    // 1. Create all members
    console.log('👥 Creating members...');
    const createdMembers = {};
    
    for (const member of members) {
      try {
        const result = await apiCall('POST', '/members', { name: member.name });
        createdMembers[member.first_name] = result;
        console.log(`✅ Created member: ${member.name}`);
      } catch (error) {
        console.log(`⚠️  Member ${member.first_name} might already exist: ${error.message}`);
        // Try to find existing member
        const allMembers = await apiCall('GET', '/members');
        const existing = allMembers.find(m => 
          m.first_name === member.first_name
        );
        if (existing) {
          createdMembers[member.first_name] = existing;
          console.log(`🔄 Using existing member: ${member.name}`);
        }
      }
    }

    console.log(`\n📊 Total members processed: ${Object.keys(createdMembers).length}\n`);

    // 2. Create recurring assignments
    console.log('🔄 Creating recurring assignments...');
    
    for (const assignment of recurringAssignments) {
      const dayIndex = getDayIndex(assignment.day);
      
      for (const memberName of assignment.members) {
        const member = createdMembers[memberName];
        if (!member) {
          console.log(`❌ Member not found: ${memberName}`);
          continue;
        }

        try {
          await apiCall('POST', '/assignments', {
            weekday: dayIndex,
            slot_type: assignment.type,
            member_id: member.id
          });
          console.log(`✅ Created assignment: ${memberName} - ${assignment.day} ${assignment.type}`);
        } catch (error) {
          console.log(`⚠️  Assignment might already exist: ${memberName} - ${assignment.day} ${assignment.type}`);
        }
      }
    }

    console.log('\n🔄 Recurring assignments completed\n');

    // 3. Create absences
    console.log('🏖️  Creating absences...');
    
    for (const absence of absences) {
      const member = createdMembers[absence.name];
      if (!member) {
        console.log(`❌ Member not found for absence: ${absence.name}`);
        continue;
      }

      try {
        await apiCall('POST', '/absences', {
          member_id: member.id,
          start_date: convertDateFormat(absence.start),
          end_date: convertDateFormat(absence.end)
        });
        console.log(`✅ Created absence: ${absence.name} (${absence.start} - ${absence.end})`);
      } catch (error) {
        console.log(`⚠️  Absence creation failed: ${absence.name} - ${error.message}`);
      }
    }

    console.log('\n🎉 Data initialization completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`   👥 Members: ${members.length}`);
    console.log(`   🔄 Recurring assignments: ${recurringAssignments.reduce((sum, a) => sum + a.members.length, 0)}`);
    console.log(`   🏖️  Absences: ${absences.length}`);

  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await fetch(`${API_BASE}/members`);
    console.log('✅ Server is running\n');
    return true;
  } catch (error) {
    console.error('❌ Server is not running. Please start the server first with: npm run dev:server');
    process.exit(1);
  }
}

// Main execution
async function main() {
  await checkServer();
  await initializeData();
}

main().catch(console.error);