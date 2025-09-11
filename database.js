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
          start_slot TEXT DEFAULT 'ouverture', -- 'ouverture' or 'fermeture' for start date
          end_slot TEXT DEFAULT 'fermeture', -- 'ouverture' or 'fermeture' for end date
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (member_id) REFERENCES members(id)
        )
      `);

      // Add slot columns to existing absence tables (migration)
      this.db.run(`
        ALTER TABLE absences ADD COLUMN start_slot TEXT DEFAULT 'ouverture';
      `, (err) => {
        // Ignore error if column already exists
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding start_slot column:', err);
        } else if (!err) {
          // Update existing records to have proper slot values
          this.db.run(`
            UPDATE absences 
            SET start_slot = 'ouverture', end_slot = 'fermeture' 
            WHERE start_slot IS NULL OR end_slot IS NULL
          `);
        }
      });
      
      this.db.run(`
        ALTER TABLE absences ADD COLUMN end_slot TEXT DEFAULT 'fermeture';
      `, (err) => {
        // Ignore error if column already exists
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding end_slot column:', err);
        }
      });

      // Audit logs table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action_type TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
          entity_type TEXT NOT NULL, -- 'member', 'recurring_assignment', 'specific_assignment', 'absence'
          entity_id INTEGER, -- ID of the affected entity (null for CREATE before entity creation)
          old_data TEXT, -- JSON of entity state before action (null for CREATE)
          new_data TEXT, -- JSON of entity state after action (null for DELETE)
          user_info TEXT, -- JSON with user details if available
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          rollback_data TEXT -- JSON with data needed to rollback this action
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

  addAbsence(memberId, startDate, endDate, startSlot = 'ouverture', endSlot = 'fermeture', callback) {
    this.db.run(
      'INSERT INTO absences (member_id, start_date, end_date, start_slot, end_slot) VALUES (?, ?, ?, ?, ?)',
      [memberId, startDate, endDate, startSlot, endSlot],
      function(err) {
        if (err) return callback(err);
        callback(null, { 
          id: this.lastID, 
          member_id: memberId, 
          start_date: startDate, 
          end_date: endDate,
          start_slot: startSlot,
          end_slot: endSlot 
        });
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

  // Check if a member is absent for a specific slot on a specific date
  isMemberAbsentForSlot(memberId, date, slot, callback) {
    // Convert slots to numbers for comparison: ouverture=1, fermeture=2
    const slotOrder = { 'ouverture': 1, 'fermeture': 2 };
    const targetSlot = slotOrder[slot];
    
    this.db.get(`
      SELECT * FROM absences 
      WHERE member_id = ? 
      AND start_date <= ? AND end_date >= ?
      AND (
        -- Multi-day absence (covers all slots) - absence spans multiple days
        (start_date < ? AND end_date > ?) OR
        -- Single day absence - check slot range coverage
        (start_date = ? AND end_date = ? AND 
         CASE WHEN start_slot = 'ouverture' THEN 1 ELSE 2 END <= ? AND
         CASE WHEN end_slot = 'ouverture' THEN 1 ELSE 2 END >= ?) OR
        -- Absence starts on this date - check if slot is covered from start
        (start_date = ? AND end_date > ? AND 
         CASE WHEN start_slot = 'ouverture' THEN 1 ELSE 2 END <= ?) OR
        -- Absence ends on this date - check if slot is covered until end
        (start_date < ? AND end_date = ? AND 
         CASE WHEN end_slot = 'ouverture' THEN 1 ELSE 2 END >= ?)
      )
    `, [memberId, date, date, date, date, date, date, targetSlot, targetSlot, date, date, targetSlot, date, date, targetSlot], (err, result) => {
      if (err) return callback(err);
      callback(null, !!result);
    });
  }

  // Audit logging methods
  logAction(actionType, entityType, entityId, oldData, newData, userInfo, rollbackData, callback) {
    const logEntry = {
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      old_data: oldData ? JSON.stringify(oldData) : null,
      new_data: newData ? JSON.stringify(newData) : null,
      user_info: userInfo ? JSON.stringify(userInfo) : null,
      rollback_data: rollbackData ? JSON.stringify(rollbackData) : null
    };

    this.db.run(`
      INSERT INTO audit_logs (action_type, entity_type, entity_id, old_data, new_data, user_info, rollback_data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      logEntry.action_type,
      logEntry.entity_type,
      logEntry.entity_id,
      logEntry.old_data,
      logEntry.new_data,
      logEntry.user_info,
      logEntry.rollback_data
    ], function(err) {
      if (err) return callback && callback(err);
      if (callback) callback(null, { id: this.lastID, ...logEntry });
    });
  }

  getAuditLogs(limit = 100, offset = 0, callback) {
    this.db.all(`
      SELECT al.id, al.action_type, al.entity_type, al.entity_id, 
             al.old_data, al.new_data, al.timestamp, al.rollback_data
      FROM audit_logs al
      ORDER BY al.timestamp DESC
      LIMIT ? OFFSET ?
    `, [limit, offset], callback);
  }

  getAuditLogsByEntity(entityType, entityId, callback) {
    this.db.all(`
      SELECT * FROM audit_logs 
      WHERE entity_type = ? AND entity_id = ?
      ORDER BY timestamp DESC
    `, [entityType, entityId], callback);
  }

  close() {
    this.db.close();
  }
}

module.exports = Database;