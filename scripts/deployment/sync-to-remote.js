#!/usr/bin/env node

const Database = require('./database');
const fetch = require('node-fetch');

// Configuration
const REMOTE_API_URL = 'https://bcfk.bini.io/api';
const LOCAL_DB = new Database();

// Utility function to make API requests
async function makeRequest(endpoint, method = 'GET', data = null) {
  const url = `${REMOTE_API_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`📡 ${method} ${url}${data ? ` - ${JSON.stringify(data)}` : ''}`);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.text();
    return result ? JSON.parse(result) : null;
  } catch (error) {
    console.error(`❌ Error making request to ${endpoint}:`, error.message);
    throw error;
  }
}

// Function to read all local data
async function readLocalData() {
  console.log('📖 Reading local database...');
  
  return new Promise((resolve, reject) => {
    const data = {
      members: [],
      recurringAssignments: [],
      specificAssignments: [],
      absences: []
    };

    // Read members
    LOCAL_DB.getAllMembers((err, members) => {
      if (err) return reject(err);
      data.members = members;

      // Read recurring assignments
      LOCAL_DB.getRecurringAssignments((err, recurringAssignments) => {
        if (err) return reject(err);
        data.recurringAssignments = recurringAssignments;

        // Read specific assignments
        LOCAL_DB.db.all('SELECT * FROM specific_assignments', (err, specificAssignments) => {
          if (err) return reject(err);
          data.specificAssignments = specificAssignments;

          // Read absences
          LOCAL_DB.db.all('SELECT * FROM absences', (err, absences) => {
            if (err) return reject(err);
            data.absences = absences;

            resolve(data);
          });
        });
      });
    });
  });
}

// Function to sync members
async function syncMembers(members) {
  console.log('👥 Syncing members...');
  const memberMap = new Map(); // local_id -> remote_member_data

  // First, get existing members from remote
  try {
    console.log('📋 Fetching existing remote members...');
    const existingMembers = await makeRequest('/members', 'GET');
    
    // Create a lookup map by name
    const existingMembersByName = new Map();
    if (Array.isArray(existingMembers)) {
      existingMembers.forEach(remoteMember => {
        if (remoteMember.full_name || remoteMember.name) {
          const name = remoteMember.full_name || remoteMember.name;
          existingMembersByName.set(name, remoteMember);
        }
      });
    }
    console.log(`📊 Found ${existingMembersByName.size} existing remote members`);

    for (const member of members) {
      const memberName = member.last_name ? `${member.first_name} ${member.last_name}` : member.first_name;
      
      // Check if member already exists
      const existingMember = existingMembersByName.get(memberName);
      if (existingMember) {
        memberMap.set(member.id, existingMember);
        console.log(`♻️  Member already exists: ${memberName} (ID: ${existingMember.id})`);
        continue;
      }

      // Try to create new member
      try {
        const memberData = {
          name: memberName
        };

        const result = await makeRequest('/members', 'POST', memberData);
        memberMap.set(member.id, result);
        console.log(`✅ Created new member: ${memberName}`);
      } catch (error) {
        if (error.message.includes('Constraint violation')) {
          console.log(`♻️  Member probably exists: ${memberName} (constraint violation)`);
          // Try to find by name in a fresh fetch
          const freshMembers = await makeRequest('/members', 'GET');
          const foundMember = Array.isArray(freshMembers) ? 
            freshMembers.find(m => (m.full_name || m.name) === memberName) : null;
          if (foundMember) {
            memberMap.set(member.id, foundMember);
          }
        } else {
          console.error(`❌ Failed to sync member ${memberName}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to fetch existing members:', error.message);
  }

  return memberMap;
}

// Function to sync recurring assignments
async function syncRecurringAssignments(assignments, memberMap) {
  console.log('📅 Syncing recurring assignments...');

  // Group assignments by weekday and slot_type
  const groupedAssignments = {};
  
  for (const assignment of assignments) {
    const key = `${assignment.weekday}-${assignment.slot_type}`;
    if (!groupedAssignments[key]) {
      groupedAssignments[key] = {
        weekday: assignment.weekday,
        slot_type: assignment.slot_type,
        member_ids: []
      };
    }
    
    // Find the remote member ID
    const remoteMember = memberMap.get(assignment.member_id);
    if (remoteMember && remoteMember.id) {
      groupedAssignments[key].member_ids.push(remoteMember.id);
    }
  }

  for (const [key, assignmentGroup] of Object.entries(groupedAssignments)) {
    if (assignmentGroup.member_ids.length > 0) {
      try {
        const assignmentData = {
          memberIds: assignmentGroup.member_ids
        };

        // Create individual assignments for each member since API expects single member_id
        for (const memberId of assignmentGroup.member_ids) {
          await makeRequest(`/assignments`, 'POST', {
            weekday: assignmentGroup.weekday,
            slot_type: assignmentGroup.slot_type,
            member_id: memberId
          });
        }
        
        console.log(`✅ Synced recurring assignment: ${assignmentGroup.weekday}/${assignmentGroup.slot_type} with ${assignmentGroup.member_ids.length} members`);
      } catch (error) {
        console.error(`❌ Failed to sync recurring assignment ${key}:`, error.message);
      }
    }
  }
}

// Function to sync specific assignments
async function syncSpecificAssignments(assignments, memberMap) {
  console.log('📋 Syncing specific assignments...');

  for (const assignment of assignments) {
    try {
      const remoteMember = memberMap.get(assignment.member_id);
      if (!remoteMember || !remoteMember.id) {
        console.warn(`⚠️ No remote member found for local member_id ${assignment.member_id}`);
        continue;
      }

      const assignmentData = {
        date: assignment.date,
        slot_type: assignment.slot_type,
        member_id: remoteMember.id,
        source: assignment.source || 'manual'
      };

      await makeRequest('/specific-assignments', 'POST', assignmentData);
      console.log(`✅ Synced specific assignment: ${assignment.date}/${assignment.slot_type}`);
    } catch (error) {
      console.error(`❌ Failed to sync specific assignment ${assignment.date}/${assignment.slot_type}:`, error.message);
    }
  }
}

// Function to sync absences
async function syncAbsences(absences, memberMap) {
  console.log('🏠 Syncing absences...');

  for (const absence of absences) {
    try {
      const remoteMember = memberMap.get(absence.member_id);
      if (!remoteMember || !remoteMember.id) {
        console.warn(`⚠️ No remote member found for local member_id ${absence.member_id}`);
        continue;
      }

      const absenceData = {
        member_id: remoteMember.id,
        start_date: absence.start_date,
        end_date: absence.end_date
      };

      await makeRequest('/absences', 'POST', absenceData);
      console.log(`✅ Synced absence: member ${remoteMember.id} from ${absence.start_date} to ${absence.end_date}`);
    } catch (error) {
      console.error(`❌ Failed to sync absence for member ${absence.member_id}:`, error.message);
    }
  }
}

// Main sync function
async function syncToRemote() {
  console.log('🚀 Starting data sync to remote server...');
  console.log(`🎯 Target: ${REMOTE_API_URL}`);
  
  try {
    // Read all local data
    const localData = await readLocalData();
    
    console.log(`📊 Found local data:
    - ${localData.members.length} members
    - ${localData.recurringAssignments.length} recurring assignments
    - ${localData.specificAssignments.length} specific assignments
    - ${localData.absences.length} absences`);

    // Test connectivity
    console.log('🔗 Testing connectivity...');
    await makeRequest('/members');
    console.log('✅ Remote server is accessible');

    // Sync data in order (members first, then assignments that depend on member IDs)
    const memberMap = await syncMembers(localData.members);
    await syncRecurringAssignments(localData.recurringAssignments, memberMap);
    await syncSpecificAssignments(localData.specificAssignments, memberMap);
    await syncAbsences(localData.absences, memberMap);

    console.log('🎉 Data sync completed successfully!');
  } catch (error) {
    console.error('💥 Sync failed:', error.message);
    process.exit(1);
  } finally {
    LOCAL_DB.close();
  }
}

// Check if node-fetch is available
try {
  require.resolve('node-fetch');
} catch (e) {
  console.error('❌ node-fetch is required. Install it with: npm install node-fetch');
  process.exit(1);
}

// Add dry-run capability
async function dryRun() {
  console.log('🔍 DRY RUN: Checking what would be synced...');
  
  try {
    const localData = await readLocalData();
    
    console.log(`📊 Local data summary:
    - ${localData.members.length} members
    - ${localData.recurringAssignments.length} recurring assignments  
    - ${localData.specificAssignments.length} specific assignments
    - ${localData.absences.length} absences`);

    console.log('\n👥 Members to sync:');
    localData.members.forEach(m => console.log(`  - ${m.first_name} ${m.last_name || ''}`));

    console.log('\n📅 Recurring assignments to sync:');
    const recurringGrouped = {};
    localData.recurringAssignments.forEach(ra => {
      const key = `${ra.weekday}-${ra.slot_type}`;
      if (!recurringGrouped[key]) recurringGrouped[key] = [];
      recurringGrouped[key].push(`${ra.first_name} ${ra.last_name || ''}`);
    });
    Object.entries(recurringGrouped).forEach(([key, members]) => {
      const [weekday, slotType] = key.split('-');
      const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
      console.log(`  - ${dayNames[weekday]} ${slotType}: ${members.join(', ')}`);
    });

    console.log('\n📋 Specific assignments to sync:');
    localData.specificAssignments.forEach(sa => {
      console.log(`  - ${sa.date} ${sa.slot_type} (member_id: ${sa.member_id})`);
    });

    console.log('\n🏠 Absences to sync:');
    localData.absences.forEach(abs => {
      console.log(`  - Member ${abs.member_id}: ${abs.start_date} to ${abs.end_date}`);
    });

  } catch (error) {
    console.error('❌ Dry run failed:', error.message);
  } finally {
    LOCAL_DB.close();
  }
}

// Run the sync if this script is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--dry-run') || args.includes('-d')) {
    dryRun();
  } else {
    console.log('💡 Tip: Use --dry-run to see what would be synced without making changes');
    console.log('Are you sure you want to sync to the remote server? This will add data to https://bcfk.bini.io');
    console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...');
    
    setTimeout(() => {
      syncToRemote();
    }, 5000);
  }
}

module.exports = { syncToRemote };