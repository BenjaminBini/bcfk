/**
 * Database Reset Helper for Tests
 *
 * Ensures tests start with a clean state:
 * - Keeps members and recurring_assignments
 * - Removes all absences and specific_assignments
 */

const Database = require('../../database');

class DatabaseReset {
  constructor() {
    // Ensure we're using the test database
    process.env.NODE_ENV = 'test';
    this.db = new Database();
  }

  /**
   * Verify we're using the test database
   */
  verifyTestDatabase() {
    if (!this.db.dbPath.includes('test')) {
      throw new Error(`❌ NOT using test database! Current path: ${this.db.dbPath}`);
    }
    console.log(`✅ Using test database: ${this.db.dbPath}`);
  }

  /**
   * Reset database to clean state for tests
   * Removes absences and specific assignments, keeps members and recurring assignments
   */
  async resetToCleanState() {
    // Safety check - ensure we're using test database
    this.verifyTestDatabase();
    return new Promise((resolve, reject) => {
      this.db.db.serialize(async () => {
        try {
          // Delete all absences
          await new Promise((res, rej) => {
            this.db.db.run('DELETE FROM absences', (err) => {
              if (err) rej(err);
              else res();
            });
          });

          // Delete all specific assignments
          await new Promise((res, rej) => {
            this.db.db.run('DELETE FROM specific_assignments', (err) => {
              if (err) rej(err);
              else res();
            });
          });

          console.log('✅ Database reset complete - removed all absences and specific assignments');
          resolve();
        } catch (error) {
          console.error('❌ Database reset failed:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Verify the database is in clean state
   */
  async verifyCleanState() {
    return new Promise((resolve, reject) => {
      this.db.db.serialize(async () => {
        try {
          // Check that absences table is empty
          const absenceCount = await new Promise((res, rej) => {
            this.db.db.get('SELECT COUNT(*) as count FROM absences', (err, row) => {
              if (err) rej(err);
              else res(row.count);
            });
          });

          // Check that specific_assignments table is empty
          const specificAssignmentCount = await new Promise((res, rej) => {
            this.db.db.get('SELECT COUNT(*) as count FROM specific_assignments', (err, row) => {
              if (err) rej(err);
              else res(row.count);
            });
          });

          // Check that we still have members
          const memberCount = await new Promise((res, rej) => {
            this.db.db.get('SELECT COUNT(*) as count FROM members', (err, row) => {
              if (err) rej(err);
              else res(row.count);
            });
          });

          // Check that we still have recurring assignments
          const recurringAssignmentCount = await new Promise((res, rej) => {
            this.db.db.get('SELECT COUNT(*) as count FROM recurring_assignments', (err, row) => {
              if (err) rej(err);
              else res(row.count);
            });
          });

          console.log(`📊 Database state verification:
            - Absences: ${absenceCount} (should be 0)
            - Specific assignments: ${specificAssignmentCount} (should be 0)
            - Members: ${memberCount} (should be > 0)
            - Recurring assignments: ${recurringAssignmentCount} (should be > 0)`);

          const isClean = absenceCount === 0 && specificAssignmentCount === 0 && memberCount > 0 && recurringAssignmentCount > 0;

          if (isClean) {
            console.log('✅ Database is in clean test state');
          } else {
            console.log('❌ Database is not in expected clean state');
          }

          resolve(isClean);
        } catch (error) {
          console.error('❌ Database state verification failed:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db && this.db.close) {
      this.db.close();
    }
  }
}

module.exports = DatabaseReset;