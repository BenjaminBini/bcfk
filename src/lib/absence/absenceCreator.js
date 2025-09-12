/**
 * Absence Creation Service
 * 
 * Handles the creation of new absences with proper error handling and notifications
 */

import { absenceActions } from "../../stores/absences.js";
import { showToast } from "../../stores/toast.js";

/**
 * Create a new absence for a member
 */
export async function createAbsence(
  memberId, 
  selectedDate, 
  memberName, 
  startSlot = 'ouverture', 
  endSlot = 'fermeture',
  onSuccess = null
) {
  try {
    await absenceActions.createAbsence(
      memberId,
      selectedDate,
      selectedDate,
      startSlot,
      endSlot
    );

    // Allow caller to handle success (like reloading data)
    if (onSuccess && typeof onSuccess === 'function') {
      setTimeout(async () => {
        await onSuccess();
        
        const slotText = (startSlot === endSlot) ? 
          ` pour ${startSlot}` : 
          (startSlot === 'ouverture' && endSlot === 'fermeture') ? '' : 
          ` de ${startSlot} à ${endSlot}`;
        
        showToast(`${memberName} marqué(e) comme absent(e)${slotText}`, "success");
      }, 150);
    }
  } catch (error) {
    console.error("Error creating absence:", error);
    showToast("Erreur lors de la création de l'absence", "error");
    throw error; // Re-throw for caller to handle if needed
  }
}