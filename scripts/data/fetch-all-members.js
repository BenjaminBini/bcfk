const Database = require('./database.js');

// This script fetches all members from small chunks and adds them to the database
// Based on the data we've seen, there are many more members in the sheet

async function fetchAndAddAllMembers() {
  const db = new Database();
  
  // Members we've discovered so far from the Google Sheet
  const knownMembers = [
    ['Adeline', 'Jeanneret'],
    ['Benjamin', 'Bini'],
    ['Bernadette', 'Laugner'],
    ['Bruno', 'Knaub'],
    ['Carmen', 'Koebel'],
    ['Caroline', 'Pfaffenhof'],
    ['Christian', 'Lieber'],
    ['Dominique', 'Lesenne'],
    ['Frédérique', 'Marchal'],
    ['Josée', 'Bechet-Zilliox'],
    ['Liliana', ''],
    ['Marie', ''],
    ['Nathalie', ''],
    ['Sandrine', 'Wantz'],
    ['Théo', 'Dettmann'],
    ['Thomas', 'Lobstein'],
    ['Anne', 'Rubin']
  ];
  
  // Add more members as we discover them - manually add the ones we find from chunks
  const additionalMembers = [
    // Add more members here as you discover them from the Google Sheet
    // Format: ['FirstName', 'LastName']
  ];
  
  const allMembers = [...knownMembers, ...additionalMembers];
  
  console.log(`Adding ${allMembers.length} members to the database...`);
  
  for (const [firstName, lastName] of allMembers) {
    try {
      await new Promise((resolve, reject) => {
        db.addMember(firstName, lastName, (err, result) => {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              console.log(`Member ${firstName} ${lastName} already exists, skipping`);
            } else {
              console.error(`Error adding ${firstName} ${lastName}:`, err);
              reject(err);
              return;
            }
          } else {
            console.log(`Added member: ${firstName} ${lastName}`);
          }
          resolve();
        });
      });
    } catch (error) {
      console.error(`Failed to add ${firstName} ${lastName}:`, error);
    }
  }
  
  // Verify all members were added
  db.getAllMembers((err, members) => {
    if (err) {
      console.error('Error getting members:', err);
    } else {
      console.log(`\nTotal members in database: ${members.length}`);
      console.log('\nAll members:');
      members.forEach(member => {
        console.log(`- ${member.full_name} (ID: ${member.id})`);
      });
    }
    db.close();
  });
}

if (require.main === module) {
  fetchAndAddAllMembers().catch(console.error);
}

module.exports = { fetchAndAddAllMembers };