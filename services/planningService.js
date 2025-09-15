const config = require("../config");

class PlanningService {
  constructor(database, memberService, absenceService = null) {
    this.db = database;
    this.memberService = memberService;
    this.absenceService = absenceService;
  }

  getCurrentWeekDates() {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(
      today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1)
    );

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      dates.push(dateStr);
    }

    return dates;
  }

  async getSpecificAssignments(startDate, endDate) {
    return new Promise((resolve, reject) => {
      this.db.getSpecificAssignments(startDate, endDate, (err, assignments) => {
        if (err) reject(err);
        else resolve(assignments);
      });
    });
  }

  async generateRecurringSlots(startDate) {
    return new Promise((resolve, reject) => {
      this.db.generateRecurringSlots(startDate, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async createSpecificAssignment(memberId, date, slotType) {
    return new Promise((resolve, reject) => {
      this.db.createSpecificAssignment(memberId, date, slotType, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async deleteSpecificAssignment(assignmentId) {
    return new Promise((resolve, reject) => {
      this.db.deleteSpecificAssignment(assignmentId, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // New unified method that computes complete schedule data for 3 weeks
  async getComputedWeeklySchedule(startDateStr, endDateStr, weekOffset) {
    try {
      if (!this.absenceService) {
        throw new Error(
          "AbsenceService is required for computed weekly schedule"
        );
      }

      // Calculate the base week dates (the week the user is viewing)
      const now = new Date();
      const baseDate = new Date(now);
      baseDate.setDate(now.getDate() + weekOffset * 7);

      const dayOfWeek = baseDate.getDay();
      const startOfBaseWeek = new Date(baseDate);
      startOfBaseWeek.setDate(
        baseDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
      );

      const formatDate = (date) => {
        return (
          date.getFullYear() +
          "-" +
          String(date.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(date.getDate()).padStart(2, "0")
        );
      };

      const formatDateFr = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR");
      };

      // Get all base data in parallel
      const [members, recurringAssignments, specificAssignments, absences] =
        await Promise.all([
          this.memberService.getMembersWithDisplayNames(),
          new Promise((resolve, reject) => {
            this.db.getRecurringAssignments((err, data) => {
              if (err) reject(err);
              else resolve(data);
            });
          }),
          this.getSpecificAssignments(startDateStr, endDateStr),
          this.absenceService.getAbsencesForWeek(startDateStr, endDateStr),
        ]);

      // Build members lookup for quick access
      const membersMap = {};
      members.forEach((member) => {
        membersMap[member.id] = member;
      });

      // Helper function to get absence details for a member on a specific date
      const getAbsenceDetails = (memberId, date, slot = null) => {
        const relevantAbsences = absences.filter((absence) => {
          if (absence.member_id !== memberId) return false;
          if (absence.start_date > date || absence.end_date < date)
            return false;

          // If slot specified, check slot coverage
          if (slot) {
            if (!absence.start_slot || !absence.end_slot) return true; // Full day absence
            if (slot === "ouverture" && absence.start_slot === "ouverture")
              return true;
            if (
              slot === "fermeture" &&
              (absence.end_slot === "fermeture" ||
                absence.start_slot === "ouverture")
            )
              return true;
            return false;
          }
          return true;
        });

        if (relevantAbsences.length === 0) return null;

        const absence = relevantAbsences[0]; // Use first matching absence

        // Format absence period text
        let periodText = "";
        if (absence.start_date === absence.end_date) {
          if (
            absence.start_slot &&
            absence.end_slot &&
            absence.start_slot === absence.end_slot
          ) {
            periodText = `le ${formatDateFr(absence.start_date)} (${
              absence.start_slot
            })`;
          } else {
            periodText = `le ${formatDateFr(absence.start_date)}`;
          }
        } else {
          let startText = formatDateFr(absence.start_date);
          let endText = formatDateFr(absence.end_date);

          if (absence.start_slot === "fermeture") {
            startText += " (fermeture)";
          }
          if (absence.end_slot === "ouverture") {
            endText += " (ouverture)";
          }

          periodText = `du ${startText} au ${endText}`;
        }

        return {
          id: absence.id,
          startDate: absence.start_date,
          endDate: absence.end_date,
          startSlot: absence.start_slot,
          endSlot: absence.end_slot,
          periodText,
        };
      };

      // Helper function to check if member is absent
      const isMemberAbsent = (memberId, date, slot = null) => {
        return getAbsenceDetails(memberId, date, slot) !== null;
      };

      // Process each day of the 3-week period
      const scheduleData = [];
      const dates = [];

      // Generate all dates in the range
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = formatDate(d);
        const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1; // Convert to 0=Monday

        dates.push(dateStr);

        // Get all members assigned to this day (from recurring assignments)
        const recurringForDay = recurringAssignments.filter(
          (assignment) => assignment.weekday === dayIndex
        );

        // Get specific assignments for this date
        const specificForDay = specificAssignments.filter(
          (assignment) => assignment.date === dateStr
        );

        // Process ouverture slot
        const ouvertureRecurring = recurringForDay.filter(
          (a) => a.slot_type === "ouverture"
        );
        const ouvertureSpecific = specificForDay.filter(
          (a) => a.slot_type === "ouverture"
        );

        const ouverturePresentAssigned = ouvertureRecurring
          .filter(
            (assignment) =>
              !isMemberAbsent(assignment.member_id, dateStr, "ouverture")
          )
          .map((assignment) => ({
            id: assignment.id,
            memberId: assignment.member_id,
            first_name:
              membersMap[assignment.member_id]?.first_name || "Unknown",
            lastName: membersMap[assignment.member_id]?.last_name || "",
          }));

        const ouvertureAbsentAssigned = ouvertureRecurring
          .filter((assignment) =>
            isMemberAbsent(assignment.member_id, dateStr, "ouverture")
          )
          .map((assignment) => ({
            id: assignment.id,
            memberId: assignment.member_id,
            first_name:
              membersMap[assignment.member_id]?.first_name || "Unknown",
            lastName: membersMap[assignment.member_id]?.last_name || "",
            absenceDetails: getAbsenceDetails(
              assignment.member_id,
              dateStr,
              "ouverture"
            ),
          }));

        const ouvertureOccasionalPresent = ouvertureSpecific
          .filter(
            (assignment) =>
              !isMemberAbsent(assignment.member_id, dateStr, "ouverture")
          )
          .map((assignment) => ({
            id: assignment.id,
            memberId: assignment.member_id,
            first_name:
              membersMap[assignment.member_id]?.first_name || "Unknown",
            lastName: membersMap[assignment.member_id]?.last_name || "",
          }));

        // Process fermeture slot (similar logic)
        const fermetureRecurring = recurringForDay.filter(
          (a) => a.slot_type === "fermeture"
        );
        const fermetureSpecific = specificForDay.filter(
          (a) => a.slot_type === "fermeture"
        );

        const fermeturePresentAssigned = fermetureRecurring
          .filter(
            (assignment) =>
              !isMemberAbsent(assignment.member_id, dateStr, "fermeture")
          )
          .map((assignment) => ({
            id: assignment.id,
            memberId: assignment.member_id,
            first_name:
              membersMap[assignment.member_id]?.first_name || "Unknown",
            lastName: membersMap[assignment.member_id]?.last_name || "",
          }));

        const fermetureAbsentAssigned = fermetureRecurring
          .filter((assignment) =>
            isMemberAbsent(assignment.member_id, dateStr, "fermeture")
          )
          .map((assignment) => ({
            id: assignment.id,
            memberId: assignment.member_id,
            first_name:
              membersMap[assignment.member_id]?.first_name || "Unknown",
            lastName: membersMap[assignment.member_id]?.last_name || "",
            absenceDetails: getAbsenceDetails(
              assignment.member_id,
              dateStr,
              "fermeture"
            ),
          }));

        const fermetureOccasionalPresent = fermetureSpecific
          .filter(
            (assignment) =>
              !isMemberAbsent(assignment.member_id, dateStr, "fermeture")
          )
          .map((assignment) => ({
            id: assignment.id,
            memberId: assignment.member_id,
            first_name:
              membersMap[assignment.member_id]?.first_name || "Unknown",
            lastName: membersMap[assignment.member_id]?.last_name || "",
          }));

        // Get all absent members for this date (for the absence row)
        const absentMembersForDate = absences
          .filter(
            (absence) =>
              absence.start_date <= dateStr && absence.end_date >= dateStr
          )
          .map((absence) => ({
            id: absence.id,
            memberId: absence.member_id,
            first_name: membersMap[absence.member_id]?.first_name || "Unknown",
            lastName: membersMap[absence.member_id]?.last_name || "",
            absenceDetails: getAbsenceDetails(absence.member_id, dateStr),
          }));

        // Group absent members by slot type for this specific day (mutually exclusive)
        const ouvertureOnlyMembers = absentMembersForDate.filter((m) => {
          const absence = m.absenceDetails;
          if (!absence) return false;
          // Ouverture only if D = endDate and slot of endDate is ouverture
          return dateStr === absence.endDate && absence.endSlot === "ouverture";
        });

        const fermetureOnlyMembers = absentMembersForDate.filter((m) => {
          const absence = m.absenceDetails;
          if (!absence) return false;
          // Fermeture only if D = startDate and slot of startDate is fermeture
          return dateStr === absence.startDate && absence.startSlot === "fermeture";
        });

        const fullDayMembers = absentMembersForDate.filter((m) => {
          const absence = m.absenceDetails;
          if (!absence) return false;

          // Skip if already categorized as slot-specific
          const isOuvertureOnly = dateStr === absence.endDate && absence.endSlot === "ouverture";
          const isFermetureOnly = dateStr === absence.startDate && absence.startSlot === "fermeture";
          if (isOuvertureOnly || isFermetureOnly) return false;

          // Full day if:
          // - D = startDate and slot of startDate is ouverture
          // - D = endDate and slot of endDate is fermeture
          // - D > startDate and D < endDate
          return (
            (dateStr === absence.startDate && absence.startSlot === "ouverture") ||
            (dateStr === absence.endDate && absence.endSlot === "fermeture") ||
            (dateStr > absence.startDate && dateStr < absence.endDate)
          );
        });

        const absentGrouped = {
          fullDay: fullDayMembers,
          ouvertureOnly: ouvertureOnlyMembers,
          fermetureOnly: fermetureOnlyMembers,
        };

        scheduleData.push({
          date: dateStr,
          dayName: config.ui.dayNames[dayIndex],
          ouverture: {
            presentAssignedMembers: ouverturePresentAssigned,
            absentAssignedMembers: ouvertureAbsentAssigned,
            occasionalPresentMembers: ouvertureOccasionalPresent,
          },
          fermeture: {
            presentAssignedMembers: fermeturePresentAssigned,
            absentAssignedMembers: fermetureAbsentAssigned,
            occasionalPresentMembers: fermetureOccasionalPresent,
          },
          allAbsentMembers: absentGrouped,
        });
      }

      return {
        dates,
        schedule: scheduleData,
      };
    } catch (error) {
      console.error("Error in getComputedWeeklySchedule:", error);
      throw new Error(`Failed to compute weekly schedule: ${error.message}`);
    }
  }
}

module.exports = PlanningService;
