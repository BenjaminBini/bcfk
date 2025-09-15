/**
 * Global Setup for Playwright Tests
 *
 * This file runs once before all tests to ensure the test environment is properly configured.
 */

const Database = require("../database");
const path = require("path");
const fs = require("fs");

// Test members data (subset for testing)
const TEST_MEMBERS = [
  { prenom: "Alice", nom: "Test" },
  { prenom: "Bob", nom: "Test" },
  { prenom: "Charlie", nom: "Test" },
  { prenom: "Diana", nom: "Test" },
  { prenom: "Eve", nom: "Test" },
];

// Basic recurring assignments for testing
const TEST_RECURRING_ASSIGNMENTS = [
  // Monday
  { weekday: 0, slot_type: "ouverture", member_names: ["Alice Test"] },
  { weekday: 0, slot_type: "fermeture", member_names: ["Bob Test"] },

  // Tuesday
  { weekday: 1, slot_type: "ouverture", member_names: ["Charlie Test"] },
  { weekday: 1, slot_type: "fermeture", member_names: ["Diana Test"] },

  // Wednesday
  { weekday: 2, slot_type: "ouverture", member_names: ["Eve Test"] },
  { weekday: 2, slot_type: "fermeture", member_names: ["Alice Test"] },

  // Thursday
  { weekday: 3, slot_type: "ouverture", member_names: ["Bob Test"] },
  { weekday: 3, slot_type: "fermeture", member_names: ["Charlie Test"] },

  // Friday
  { weekday: 4, slot_type: "ouverture", member_names: ["Diana Test"] },
  { weekday: 4, slot_type: "fermeture", member_names: ["Eve Test"] },

  // Saturday
  {
    weekday: 5,
    slot_type: "ouverture",
    member_names: ["Alice Test", "Bob Test"],
  },
  { weekday: 5, slot_type: "fermeture", member_names: ["Charlie Test"] },

  // Sunday
  { weekday: 6, slot_type: "ouverture", member_names: ["Diana Test"] },
  { weekday: 6, slot_type: "fermeture", member_names: ["Eve Test"] },
];

async function globalSetup() {
  console.log("🧪 Setting up test environment...");

  // Set NODE_ENV to test
  process.env.NODE_ENV = "test";

  // Clean up any existing test database
  const testDataDir = path.join(__dirname, "..", "test-data");
  const testDbPath = path.join(testDataDir, "planning-test.db");

  if (fs.existsSync(testDbPath)) {
    console.log("🗑️ Removing existing test database...");
    fs.unlinkSync(testDbPath);
  }

  // Initialize test database
  console.log("🏗️ Creating test database...");
  const testDb = new Database();

  try {
    // Add test members
    console.log("👥 Adding test members...");
    for (const member of TEST_MEMBERS) {
      await new Promise((resolve, reject) => {
        testDb.addMember(member.prenom, member.nom, (err) => {
          if (err) {
            console.error(
              `❌ Error adding member ${member.prenom} ${member.nom}:`,
              err
            );
            reject(err);
          } else {
            console.log(`✅ Added member: ${member.prenom} ${member.nom}`);
            resolve();
          }
        });
      });
    }

    // Get all members to map names to IDs
    const allMembers = await new Promise((resolve, reject) => {
      testDb.getAllMembers((err, members) => {
        if (err) reject(err);
        else resolve(members);
      });
    });

    const memberMap = {};
    allMembers.forEach((member) => {
      const fullName = member.last_name
        ? `${member.first_name} ${member.last_name}`
        : member.first_name;
      memberMap[fullName] = member.id;
    });

    // Add test recurring assignments
    console.log("📅 Adding test recurring assignments...");
    for (const assignment of TEST_RECURRING_ASSIGNMENTS) {
      const memberIds = assignment.member_names
        .map((name) => memberMap[name])
        .filter((id) => id !== undefined);

      if (memberIds.length > 0) {
        await new Promise((resolve, reject) => {
          testDb.setRecurringAssignment(
            assignment.weekday,
            assignment.slot_type,
            memberIds,
            (err) => {
              if (err) {
                console.error(
                  `❌ Error setting assignment for ${assignment.weekday}/${assignment.slot_type}:`,
                  err
                );
                reject(err);
              } else {
                console.log(
                  `✅ Set assignment: ${assignment.weekday}/${
                    assignment.slot_type
                  } -> ${assignment.member_names.join(", ")}`
                );
                resolve();
              }
            }
          );
        });
      }
    }

    console.log("✅ Test database initialized successfully!");
    console.log(`📍 Test database location: ${testDb.dbPath}`);
  } catch (error) {
    console.error("❌ Failed to initialize test database:", error);
    throw error;
  } finally {
    testDb.close();
  }
}

module.exports = globalSetup;
