const Database = require('../../database.js');

async function clearAllAbsences() {
  console.log('🗑️  Clearing all absences from database...');
  
  const db = new Database();
  
  try {
    // Get count before deletion
    const countBefore = await new Promise((resolve, reject) => {
      db.db.get('SELECT COUNT(*) as count FROM absences', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    console.log(`📊 Found ${countBefore} absences to delete`);
    
    if (countBefore === 0) {
      console.log('✅ No absences to delete');
      return;
    }
    
    // Delete all absences
    await new Promise((resolve, reject) => {
      db.db.run('DELETE FROM absences', function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    
    console.log(`✅ Successfully deleted ${countBefore} absences`);
    
    // Verify deletion
    const countAfter = await new Promise((resolve, reject) => {
      db.db.get('SELECT COUNT(*) as count FROM absences', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    console.log(`📊 Absences remaining: ${countAfter}`);
    
  } catch (error) {
    console.error('❌ Error clearing absences:', error);
  } finally {
    db.close();
  }
}

clearAllAbsences();