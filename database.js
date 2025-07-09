const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, 'planning.db'));
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

      // Default assignments table (weekday + slot type + members)
      this.db.run(`
        CREATE TABLE IF NOT EXISTS default_assignments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          weekday INTEGER NOT NULL, -- 0=Monday, 6=Sunday
          slot_type TEXT NOT NULL, -- 'ouverture' or 'fermeture'
          member_id INTEGER NOT NULL,
          FOREIGN KEY (member_id) REFERENCES members(id),
          UNIQUE(weekday, slot_type, member_id)
        )
      `);

      // Concrete weekly slots table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS weekly_slots (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL, -- YYYY-MM-DD format
          slot_type TEXT NOT NULL, -- 'ouverture' or 'fermeture'
          member_id INTEGER NOT NULL,
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

  // Default assignments methods
  getDefaultAssignments(callback) {
    this.db.all(`
      SELECT da.*, m.first_name, m.last_name,
             (m.first_name || CASE WHEN m.last_name != "" THEN " " || m.last_name ELSE "" END) as member_name
      FROM default_assignments da
      JOIN members m ON da.member_id = m.id
      ORDER BY da.weekday, da.slot_type, m.first_name, m.last_name
    `, callback);
  }

  setDefaultAssignment(weekday, slotType, memberIds, callback) {
    this.db.serialize(() => {
      // Remove existing assignments for this weekday/slot
      this.db.run(
        'DELETE FROM default_assignments WHERE weekday = ? AND slot_type = ?',
        [weekday, slotType]
      );

      // Add new assignments
      const stmt = this.db.prepare(
        'INSERT INTO default_assignments (weekday, slot_type, member_id) VALUES (?, ?, ?)'
      );
      
      memberIds.forEach(memberId => {
        stmt.run([weekday, slotType, memberId]);
      });
      
      stmt.finalize(callback);
    });
  }

  // Weekly slots methods
  getWeeklySlots(startDate, endDate, callback) {
    this.db.all(`
      SELECT ws.*, m.first_name, m.last_name,
             (m.first_name || CASE WHEN m.last_name != "" THEN " " || m.last_name ELSE "" END) as member_name
      FROM weekly_slots ws
      JOIN members m ON ws.member_id = m.id
      WHERE ws.date >= ? AND ws.date <= ?
      ORDER BY ws.date, ws.slot_type, m.first_name, m.last_name
    `, [startDate, endDate], callback);
  }

  generateWeeklySlots(startDate, callback) {
    // Generate slots for a week based on default assignments
    this.db.all(`
      SELECT da.*, m.first_name, m.last_name,
             (m.first_name || CASE WHEN m.last_name != "" THEN " " || m.last_name ELSE "" END) as member_name
      FROM default_assignments da
      JOIN members m ON da.member_id = m.id
      ORDER BY da.weekday, da.slot_type
    `, (err, defaultAssignments) => {
      if (err) return callback(err);

      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        // First, clear existing weekly slots for this week
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        const endDateStr = endDate.toISOString().split('T')[0];
        
        this.db.run(
          'DELETE FROM weekly_slots WHERE date >= ? AND date <= ?',
          [startDate, endDateStr],
          (err) => {
            if (err) {
              this.db.run('ROLLBACK');
              return callback(err);
            }
            
            // Then insert the new slots from defaults
            const stmt = this.db.prepare(
              'INSERT INTO weekly_slots (date, slot_type, member_id) VALUES (?, ?, ?)'
            );

            defaultAssignments.forEach(assignment => {
              const date = new Date(startDate);
              date.setDate(date.getDate() + assignment.weekday);
              const dateStr = date.toISOString().split('T')[0];
              
              stmt.run([dateStr, assignment.slot_type, assignment.member_id]);
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

  updateWeeklySlot(date, slotType, memberIds, callback) {
    this.db.serialize(() => {
      // Remove existing assignments for this date/slot
      this.db.run(
        'DELETE FROM weekly_slots WHERE date = ? AND slot_type = ?',
        [date, slotType]
      );

      // Add new assignments
      const stmt = this.db.prepare(
        'INSERT INTO weekly_slots (date, slot_type, member_id) VALUES (?, ?, ?)'
      );
      
      memberIds.forEach(memberId => {
        stmt.run([date, slotType, memberId]);
      });
      
      stmt.finalize(callback);
    });
  }

  createAssignment(weekday, slot_type, member_id, callback) {
    this.db.run(
      'INSERT INTO default_assignments (weekday, slot_type, member_id) VALUES (?, ?, ?)',
      [weekday, slot_type, member_id],
      function(err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID, weekday, slot_type, member_id });
      }
    );
  }

  deleteAssignment(id, callback) {
    this.db.run('DELETE FROM default_assignments WHERE id = ?', [id], callback);
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