import { isMemberAbsent, isMemberAbsentForSlot } from './absence/absenceChecker.js';
import { formatDate, getAbsencePeriod } from './absence/absenceUtils.js';
import { getAbsentScheduledMembers, getOtherAbsentMembers } from './absence/absenceQueries.js';
import { createAbsence } from './absence/absenceCreator.js';
import { 
  weeklyAbsences, 
  loadWeeklyAbsences as loadWeeklyAbsencesStore,
  getAbsentMembersForDate as getAbsentMembersForDateStore,
  getAbsentMembersForDateWithSlots as getAbsentMembersForDateWithSlotsStore
} from '../stores/weeklyAbsences.js';

export function createAbsenceManagement(weekNavigationLogic) {
  let currentAbsences = $state([]);

  $effect(() => {
    weeklyAbsences.subscribe(value => currentAbsences = value)();
  });

  async function loadWeeklyAbsences() {
    return await loadWeeklyAbsencesStore(weekNavigationLogic);
  }

  function getAbsentMembersForDate(dateIndex) {
    return getAbsentMembersForDateStore(dateIndex, weekNavigationLogic);
  }

  async function getAbsentMembersForDateWithSlots(dateIndex) {
    return await getAbsentMembersForDateWithSlotsStore(dateIndex, weekNavigationLogic);
  }

  async function createAbsenceWrapper(memberId, selectedDate, memberName, startSlot = 'ouverture', endSlot = 'fermeture') {
    return await createAbsence(memberId, selectedDate, memberName, startSlot, endSlot, loadWeeklyAbsences);
  }

  function checkMemberAbsent(memberId, dateIndex) {
    return isMemberAbsent(memberId, dateIndex, currentAbsences, weekNavigationLogic);
  }

  function checkMemberAbsentForSlot(memberId, dateIndex, slot) {
    return isMemberAbsentForSlot(memberId, dateIndex, slot, currentAbsences, weekNavigationLogic);
  }

  function getFormattedAbsencePeriod(memberId, dateIndex = null) {
    return getAbsencePeriod(memberId, currentAbsences, weekNavigationLogic, dateIndex);
  }

  function queryAbsentScheduledMembers(dateIndex, slotType, slotSchedule) {
    return getAbsentScheduledMembers(
      dateIndex, 
      slotType, 
      slotSchedule, 
      currentAbsences, 
      (memberId, dateIndex, slot) => checkMemberAbsentForSlot(memberId, dateIndex, slot)
    );
  }

  function queryOtherAbsentMembers(dateIndex, slotSchedule) {
    return getOtherAbsentMembers(dateIndex, slotSchedule, currentAbsences, weekNavigationLogic);
  }

  return {
    weeklyAbsences,
    loadWeeklyAbsences,
    isMemberAbsent: checkMemberAbsent,
    isMemberAbsentForSlot: checkMemberAbsentForSlot,
    getAbsencePeriod: getFormattedAbsencePeriod,
    getAbsentMembersForDate,
    getAbsentMembersForDateWithSlots,
    getAbsentScheduledMembers: queryAbsentScheduledMembers,
    getOtherAbsentMembers: queryOtherAbsentMembers,
    createAbsence: createAbsenceWrapper,
    formatDate
  };
}