const fetch = require('node-fetch');

// API configurations
const LOCAL_API = 'http://localhost:3001/api';
const REMOTE_API = 'https://bcfk.bini.io/api';

// Date range to clear (July 2025)
const START_DATE = '2025-07-01';
const END_DATE = '2025-07-31';

// Specific assignments data with correct slot types
const specificAssignments = [
  { date: '06/07/2025', day: 'dimanche', members: ['Adeline', 'Bruno'], slot_type: 'fermeture' },
  { date: '07/07/2025', day: 'lundi', members: ['Nathalie', 'Bruno'], slot_type: 'fermeture' },
  { date: '10/07/2025', day: 'jeudi', members: ['Bruno'], slot_type: 'ouverture' },
  { date: '11/07/2025', day: 'vendredi', members: ['Bruno'], slot_type: 'ouverture' },
  { date: '11/07/2025', day: 'vendredi', members: ['Bruno'], slot_type: 'fermeture' },
  { date: '13/07/2025', day: 'dimanche', members: ['Benjamin'], slot_type: 'ouverture' },
  { date: '13/07/2025', day: 'dimanche', members: ['Sandrine', 'Frédérique'], slot_type: 'fermeture' },
  { date: '14/07/2025', day: 'lundi', members: ['Bruno'], slot_type: 'ouverture' },
  { date: '14/07/2025', day: 'lundi', members: ['Nathalie', 'Bruno'], slot_type: 'fermeture' },
  { date: '15/07/2025', day: 'mardi', members: ['Bruno'], slot_type: 'ouverture' },
  { date: '16/07/2025', day: 'mercredi', members: ['Bruno'], slot_type: 'ouverture' },
  { date: '16/07/2025', day: 'mercredi', members: ['Frédérique', 'Benjamin'], slot_type: 'fermeture' },
  { date: '17/07/2025', day: 'jeudi', members: ['Bruno'], slot_type: 'ouverture' },
  { date: '18/07/2025', day: 'vendredi', members: ['Bruno'], slot_type: 'ouverture' },
  { date: '18/07/2025', day: 'vendredi', members: ['Théo'], slot_type: 'fermeture' },
  { date: '21/07/2025', day: 'lundi', members: ['Dominique'], slot_type: 'ouverture' },
  { date: '21/07/2025', day: 'lundi', members: ['Théo'], slot_type: 'fermeture' },
  { date: '22/07/2025', day: 'mardi', members: ['Théo'], slot_type: 'fermeture' },
  { date: '25/07/2025', day: 'vendredi', members: ['Théo'], slot_type: 'fermeture' }
];

// Helper functions
function convertDateFormat(dateStr) {
  // Convert from DD/MM/YYYY to YYYY-MM-DD
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

async function apiCall(baseUrl, method, endpoint, data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${baseUrl}${endpoint}`, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API call failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

async function getMembers(apiUrl) {
  return await apiCall(apiUrl, 'GET', '/members');
}

async function getSpecificAssignments(apiUrl) {
  return await apiCall(apiUrl, 'GET', `/specific-assignments?start_date=${START_DATE}&end_date=${END_DATE}`);
}

async function clearExistingAssignments(apiUrl, apiName) {
  console.log(`\n🗑️  Clearing existing July 2025 assignments from ${apiName}...\n`);

  try {
    const assignments = await getSpecificAssignments(apiUrl);
    console.log(`📋 Found ${assignments.length} existing assignments to clear`);

    let deletedCount = 0;
    for (const assignment of assignments) {
      try {
        await apiCall(apiUrl, 'DELETE', `/specific-assignments/${assignment.id}`);
        console.log(`✅ Deleted assignment ID ${assignment.id}`);
        deletedCount++;
      } catch (error) {
        console.log(`❌ Failed to delete assignment ID ${assignment.id}: ${error.message}`);
      }
    }

    console.log(`\n📊 ${apiName} Cleanup Summary: ${deletedCount} assignments deleted`);
  } catch (error) {
    console.error(`❌ Failed to clear assignments from ${apiName}:`, error.message);
  }
}

async function addSpecificAssignmentsToAPI(apiUrl, apiName) {
  console.log(`\n🎯 Adding specific assignments to ${apiName}...\n`);

  try {
    // Get all members to map names to IDs
    const members = await getMembers(apiUrl);
    const memberMap = new Map();
    
    members.forEach(member => {
      // Handle both 'name' and 'first_name' fields
      const firstName = member.first_name || member.name?.split(' ')[0] || '';
      if (firstName) {
        memberMap.set(firstName, member);
      }
    });

    console.log(`📋 Found ${members.length} members in ${apiName}`);
    
    // Process each assignment
    let successCount = 0;
    let skipCount = 0;
    
    for (const assignment of specificAssignments) {
      const isoDate = convertDateFormat(assignment.date);
      
      for (const memberName of assignment.members) {
        const member = memberMap.get(memberName);
        if (!member) {
          console.log(`❌ Member not found: ${memberName}`);
          continue;
        }

        try {
          await apiCall(apiUrl, 'POST', '/specific-assignments', {
            member_id: member.id,
            date: isoDate,
            slot_type: assignment.slot_type
          });
          
          console.log(`✅ ${memberName} - ${assignment.date} (${assignment.day}) ${assignment.slot_type}`);
          successCount++;
        } catch (error) {
          if (error.message.includes('UNIQUE constraint') || error.message.includes('Constraint violation')) {
            console.log(`⏭️  ${memberName} - ${assignment.date} (${assignment.day}) ${assignment.slot_type} - already exists`);
            skipCount++;
          } else {
            console.log(`❌ ${memberName} - ${assignment.date} (${assignment.day}) ${assignment.slot_type} - ${error.message}`);
          }
        }
      }
    }

    console.log(`\n📊 ${apiName} Summary:`);
    console.log(`   ✅ Created: ${successCount}`);
    console.log(`   ⏭️  Skipped (already exist): ${skipCount}`);
    
  } catch (error) {
    console.error(`❌ Failed to add assignments to ${apiName}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Clearing existing July 2025 assignments and adding corrected ones...');
  
  // Test connectivity first
  try {
    await apiCall(LOCAL_API, 'GET', '/members');
    console.log('✅ Local API accessible');
  } catch (error) {
    console.error('❌ Local API not accessible. Please start the server: npm run dev:server');
    return;
  }
  
  try {
    await apiCall(REMOTE_API, 'GET', '/members');
    console.log('✅ Remote API accessible');
  } catch (error) {
    console.error('❌ Remote API not accessible:', error.message);
    return;
  }

  // Clear existing assignments from both APIs
  await clearExistingAssignments(LOCAL_API, 'Local API');
  await clearExistingAssignments(REMOTE_API, 'Remote API');

  // Add corrected assignments to both APIs
  await addSpecificAssignmentsToAPI(LOCAL_API, 'Local API');
  await addSpecificAssignmentsToAPI(REMOTE_API, 'Remote API');
  
  console.log('\n🎉 Assignment correction completed!');
}

// Check if node-fetch is available
try {
  require.resolve('node-fetch');
} catch (e) {
  console.error('❌ node-fetch is required. Install it with: npm install node-fetch');
  process.exit(1);
}

main().catch(console.error);