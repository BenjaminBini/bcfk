const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    // Use data directory for database persistence in Docker
    const dataDir = path.join(__dirname, 'data');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const dbPath = path.join(dataDir, 'planning.db');
    this.db = new sqlite3.Database(dbPath);
    this.init();
  }

  init() {
    this.db.serialize(() => {
      // Members table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS members (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL DEFAULT '',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(first_name, last_name)
        )
      `);

      // Recurring assignments table (weekday + slot type + members)
      this.db.run(`
        CREATE TABLE IF NOT EXISTS recurring_assignments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          weekday INTEGER NOT NULL, -- 0=Monday, 6=Sunday
          slot_type TEXT NOT NULL, -- 'ouverture' or 'fermeture'
          member_id INTEGER NOT NULL,
          FOREIGN KEY (member_id) REFERENCES members(id),
          UNIQUE(weekday, slot_type, member_id)
        )
      `);

      // Specific date assignments table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS specific_assignments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL, -- YYYY-MM-DD format
          slot_type TEXT NOT NULL, -- 'ouverture' or 'fermeture'
          member_id INTEGER NOT NULL,
          source TEXT NOT NULL DEFAULT 'manual', -- 'manual' or 'generated'
          FOREIGN KEY (member_id) REFERENCES members(id),
          UNIQUE(date, slot_type, member_id)
        )
      `);


      // Absences table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS absences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          member_id INTEGER NOT NULL,
          start_date TEXT NOT NULL, -- YYYY-MM-DD format
          end_date TEXT NOT NULL, -- YYYY-MM-DD format
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (member_id) REFERENCES members(id)
        )
      `);
    });
  }

  // Members methods
  getAllMembers(callback) {
    this.db.all('SELECT *, (first_name || CASE WHEN last_name != "" THEN " " || last_name ELSE "" END) as full_name FROM members ORDER BY first_name, last_name', callback);
  }

  addMember(firstName, lastName, callback) {
    if (typeof lastName === 'function') {
      callback = lastName;
      lastName = '';
    }
    this.db.run('INSERT INTO members (first_name, last_name) VALUES (?, ?)', [firstName, lastName || ''], callback);
  }

  // Recurring assignments methods
  getRecurringAssignments(callback) {
    this.db.all(`
      SELECT ra.*, m.first_name, m.last_name,
             (m.first_name || CASE WHEN m.last_name != "" THEN " " || m.last_name ELSE "" END) as member_name
      FROM recurring_assignments ra
      JOIN members m ON ra.member_id = m.id
      ORDER BY ra.weekday, ra.slot_type, m.first_name, m.last_name
    `, callback);
  }

  setRecurringAssignment(weekday, slotType, memberIds, callback) {
    this.db.serialize(() => {
      // Remove existing assignments for this weekday/slot
      this.db.run(
        'DELETE FROM recurring_assignments WHERE weekday = ? AND slot_type = ?',
        [weekday, slotType]
      );

      // Add new assignments
      const stmt = this.db.prepare(
        'INSERT INTO recurring_assignments (weekday, slot_type, member_id) VALUES (?, ?, ?)'
      );
      
      memberIds.forEach(memberId => {
        stmt.run([weekday, slotType, memberId]);
      });
      
      stmt.finalize(callback);
    });
  }

  // Specific assignments methods
  getSpecificAssignments(startDate, endDate, callback) {
    this.db.all(`
      SELECT sa.*, m.first_name, m.last_name,
             (m.first_name || CASE WHEN m.last_name != "" THEN " " || m.last_name ELSE "" END) as member_name
      FROM specific_assignments sa
      JOIN members m ON sa.member_id = m.id
      WHERE sa.date >= ? AND sa.date <= ?
      ORDER BY sa.date, sa.slot_type, m.first_name, m.last_name
    `, [startDate, endDate], callback);
  }


  generateRecurringSlots(startDate, callback) {
    // Generate specific assignments for a week based on recurring assignments
    // ONLY create 'generated' assignments, never touch 'manual' ones
    this.db.all(`
      SELECT ra.*, m.first_name, m.last_name,
             (m.first_name || CASE WHEN m.last_name != "" THEN " " || m.last_name ELSE "" END) as member_name
      FROM recurring_assignments ra
      JOIN members m ON ra.member_id = m.id
      ORDER BY ra.weekday, ra.slot_type
    `, (err, recurringAssignments) => {
      if (err) return callback(err);

      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        // Only delete GENERATED assignments for this week, preserve manual ones
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
        
        this.db.run(
          'DELETE FROM specific_assignments WHERE date >= ? AND date <= ? AND source = ?',
          [startDate, endDateStr, 'generated'],
          (err) => {
            if (err) {
              this.db.run('ROLLBACK');
              return callback(err);
            }
            
            // Then insert the new slots from recurring assignments
            const stmt = this.db.prepare(
              'INSERT INTO specific_assignments (date, slot_type, member_id, source) VALUES (?, ?, ?, ?)'
            );

            recurringAssignments.forEach(assignment => {
              const date = new Date(startDate);
              date.setDate(date.getDate() + assignment.weekday);
              const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              
              stmt.run([dateStr, assignment.slot_type, assignment.member_id, 'generated']);
            });

            stmt.finalize((err) => {
              if (err) {
                this.db.run('ROLLBACK');
                return callback(err);
              }
              this.db.run('COMMIT', callback);
            });
          }
        );
      });
    });
  }


  createSpecificAssignment(memberId, date, slotType, callback) {
    this.db.run(
      'INSERT INTO specific_assignments (date, slot_type, member_id, source) VALUES (?, ?, ?, ?)',
      [date, slotType, memberId, 'manual'],
      function(err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID, member_id: memberId, date, slot_type: slotType, source: 'manual' });
      }
    );
  }

  createRecurringAssignment(weekday, slot_type, member_id, callback) {
    this.db.run(
      'INSERT INTO recurring_assignments (weekday, slot_type, member_id) VALUES (?, ?, ?)',
      [weekday, slot_type, member_id],
      function(err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID, weekday, slot_type, member_id });
      }
    );
  }

  deleteRecurringAssignment(id, callback) {
    this.db.run('DELETE FROM recurring_assignments WHERE id = ?', [id], callback);
  }

  deleteSpecificAssignment(id, callback) {
    this.db.run('DELETE FROM specific_assignments WHERE id = ?', [id], callback);
  }

  // Absences methods
  getAllAbsences(callback) {
    this.db.all(`
      SELECT a.*, m.first_name, m.last_name,
             (m.first_name || CASE WHEN m.last_name != "" THEN " " || m.last_name ELSE "" END) as member_name
      FROM absences a
      JOIN members m ON a.member_id = m.id
      ORDER BY a.start_date DESC, m.first_name, m.last_name
    `, callback);
  }

  addAbsence(memberId, startDate, endDate, callback) {
    this.db.run(
      'INSERT INTO absences (member_id, start_date, end_date) VALUES (?, ?, ?)',
      [memberId, startDate, endDate],
      function(err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID, member_id: memberId, start_date: startDate, end_date: endDate });
      }
    );
  }

  deleteAbsence(id, callback) {
    this.db.run('DELETE FROM absences WHERE id = ?', [id], callback);
  }

  getAbsencesForDateRange(startDate, endDate, callback) {
    this.db.all(`
      SELECT a.*, m.first_name, m.last_name,
             (m.first_name || CASE WHEN m.last_name != "" THEN " " || m.last_name ELSE "" END) as member_name
      FROM absences a
      JOIN members m ON a.member_id = m.id
      WHERE (a.start_date <= ? AND a.end_date >= ?)
         OR (a.start_date >= ? AND a.start_date <= ?)
         OR (a.end_date >= ? AND a.end_date <= ?)
      ORDER BY m.first_name, m.last_name
    `, [endDate, startDate, startDate, endDate, startDate, endDate], callback);
  }

  close() {
    this.db.close();
  }
}

module.exports = Database;