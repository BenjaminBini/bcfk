<script>
  import { absenceActions } from "../../stores/absences.js";
  import { showToast } from "../../stores/toast.js";

  let { loadWeeklyAbsences } = $props();

  async function createAbsence(memberId, selectedDate, memberName, startSlot = 'ouverture', endSlot = 'fermeture') {
    try {
      await absenceActions.createAbsence(
        memberId,
        selectedDate,
        selectedDate,
        startSlot,
        endSlot
      );

      setTimeout(async () => {
        await loadWeeklyAbsences();
        const slotText = (startSlot === endSlot) ? 
          ` pour ${startSlot}` : 
          (startSlot === 'ouverture' && endSlot === 'fermeture') ? '' : 
          ` de ${startSlot} à ${endSlot}`;
        showToast(`${memberName} marqué(e) comme absent(e)${slotText}`, "success");
      }, 150);
    } catch (error) {
      console.error("Error creating absence:", error);
      showToast("Erreur lors de la création de l'absence", "error");
    }
  }

  export { createAbsence };
</script>