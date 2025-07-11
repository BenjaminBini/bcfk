const Database = require('./database.js');

// Script to import absences from Google Sheet "Absences"
// Fetches data in small chunks to avoid token limits

async function importAbsences() {
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
  
  // Convert Excel date number to YYYY-MM-DD format
  function excelDateToYMD(excelDate) {
    // Excel date is days since 1900-01-01 (with leap year bug compensation)
    const baseDate = new Date(1900, 0, 1);
    const daysSince = excelDate - 2; // Adjust for Excel's leap year bug
    const resultDate = new Date(baseDate.getTime() + daysSince * 24 * 60 * 60 * 1000);
    return resultDate.getFullYear() + '-' + 
           String(resultDate.getMonth() + 1).padStart(2, '0') + '-' + 
           String(resultDate.getDate()).padStart(2, '0');
  }
  
  // Complete absences discovered from the Google Sheet "Absences" tab
  const absences = [
    // Original 4 absences (rows 2-5)
    {
      firstName: 'benjamin',
      startDate: 45844, // 06/07/2025
      endDate: 45844    // 06/07/2025
    },
    {
      firstName: 'anne',
      startDate: 45847, // 09/07/2025
      endDate: 45865    // 27/07/2025
    },
    {
      firstName: 'bernadette',
      startDate: 45848, // 10/07/2025
      endDate: 45865    // 27/07/2025
    },
    {
      firstName: 'frédérique',
      startDate: 45856, // 18/07/2025
      endDate: 45859    // 21/07/2025
    },
    // Additional absences (rows 6-10)
    {
      firstName: 'thomas',
      startDate: 45856, // 18/07/2025
      endDate: 45859    // 21/07/2025
    },
    {
      firstName: 'sandrine',
      startDate: 45860, // 22/07/2025
      endDate: 45875    // 06/08/2025
    },
    {
      firstName: 'marie',
      startDate: 45863, // 25/07/2025
      endDate: 45891    // 22/08/2025
    },
    {
      firstName: 'frédérique',
      startDate: 45873, // 04/08/2025 (second absence)
      endDate: 45900    // 31/08/2025
    },
    {
      firstName: 'thomas',
      startDate: 45873, // 04/08/2025 (second absence)
      endDate: 45900    // 31/08/2025
    },
    // Additional absences (rows 11-15)
    {
      firstName: 'benjamin',
      startDate: 45874, // 05/08/2025 (second absence)
      endDate: 45891    // 22/08/2025
    },
    {
      firstName: 'carmen',
      startDate: 45887, // 18/08/2025
      endDate: 45900    // 31/08/2025
    },
    {
      firstName: 'bruno',
      startDate: 45858, // 20/07/2025
      endDate: 45893    // 24/08/2025
    },
    {
      firstName: 'nathalie',
      startDate: 45858, // 20/07/2025
      endDate: 45893    // 24/08/2025
    },
    {
      firstName: 'dominique',
      startDate: 45780, // 03/05/2025
      endDate: 45874    // 05/08/2025
    },
    // Final absences (rows 16-17)
    {
      firstName: 'caroline',
      startDate: 45878, // 09/08/2025
      endDate: 45893    // 24/08/2025
    },
    {
      firstName: 'liliana',
      startDate: 45839, // 01/07/2025
      endDate: 45900    // 31/08/2025
    }
  ];
  
  console.log(`\nImporting ${absences.length} absences...`);
  
  for (const absence of absences) {
    const memberId = membersByFirstName[absence.firstName.toLowerCase()];
    
    if (!memberId) {
      console.warn(`Member not found: ${absence.firstName}`);
      continue;
    }
    
    const startDateYMD = excelDateToYMD(absence.startDate);
    const endDateYMD = excelDateToYMD(absence.endDate);
    
    // Import this absence
    try {
      await new Promise((resolve, reject) => {
        db.addAbsence(memberId, startDateYMD, endDateYMD, (err, result) => {
          if (err) {
            console.error(`Error adding absence for ${absence.firstName}:`, err);
            reject(err);
          } else {
            console.log(`✓ Added absence: ${absence.firstName} from ${startDateYMD} to ${endDateYMD}`);
            resolve(result);
          }
        });
      });
    } catch (error) {
      console.error(`Failed to add absence for ${absence.firstName}:`, error);
    }
  }
  
  // Verify all absences were imported
  console.log('\nAll absences in database:');
  db.getAllAbsences((err, absences) => {
    if (err) {
      console.error('Error getting absences:', err);
    } else {
      console.log(`Total absences: ${absences.length}`);
      absences.forEach(absence => {
        console.log(`- ${absence.member_name}: ${absence.start_date} to ${absence.end_date}`);
      });
    }
    db.close();
  });
}

if (require.main === module) {
  importAbsences().catch(console.error);
}

module.exports = { importAbsences };