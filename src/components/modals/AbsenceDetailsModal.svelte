<script>
  import { fly, fade } from 'svelte/transition';
  
  /**
   * @typedef {Object} Props
   * @property {boolean} [show]
   * @property {string} [memberName]
   * @property {any} [absenceData]
   * @property {function} [onclose] - Callback for close action
   * @property {function} [onedit] - Callback for edit action
   * @property {function} [ondelete] - Callback for delete action
   */

  /** @type {Props} */
  let {
    show = false,
    memberName = '',
    absenceData = null,
    onclose,
    onedit,
    ondelete
  } = $props();

  // Fonction pour formater les dates selon les règles demandées avec HTML pour highlight
  function formatAbsencePeriod(startDateStr, endDateStr, startSlot = null, endSlot = null) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    const months = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    
    const startDay = startDate.getDate();
    const startMonth = months[startDate.getMonth()];
    const startYear = startDate.getFullYear();
    
    const endDay = endDate.getDate();
    const endMonth = months[endDate.getMonth()];
    const endYear = endDate.getFullYear();
    
    // Same start and end date (single day absence)
    if (startDateStr === endDateStr) {
      // Check if it's a partial slot absence
      if (startSlot && endSlot && startSlot === endSlot) {
        return {
          text: `Absence prévue le `,
          date: `${startDay} ${startMonth} ${startYear} (${startSlot})`
        };
      }
      // Full day absence or both slots
      return {
        text: `Absence prévue le `,
        date: `${startDay} ${startMonth} ${startYear}`
      };
    }
    
    // Multi-day absence - build start and end text with slot info
    let startText = `${startDay} ${startMonth}`;
    let endText = `${endDay} ${endMonth}`;
    
    // Add year to start if different years or same year but different months
    if (startYear !== endYear || startDate.getMonth() !== endDate.getMonth()) {
      if (startYear !== endYear) {
        startText += ` ${startYear}`;
      }
    }
    
    // Always add year to end
    if (startYear === endYear && startDate.getMonth() === endDate.getMonth()) {
      // Same month and year - add year only to end
      endText += ` ${endYear}`;
    } else {
      endText += ` ${endYear}`;
      if (startYear === endYear && startDate.getMonth() !== endDate.getMonth()) {
        // Same year but different months - add year to end, format as requested
        startText += ` ${startYear}`;
      }
    }
    
    // Add slot info to start date if it starts with "fermeture" slot
    if (startSlot === 'fermeture') {
      startText += ' (fermeture)';
    }

    // Add slot info to end date if it ends with "ouverture" slot  
    if (endSlot === 'ouverture') {
      endText += ' (ouverture)';
    }
    
    return {
      text: `Absence prévue du `,
      date: `${startText} au ${endText}`
    };
  }

  let formattedPeriod = $derived(
    absenceData ? formatAbsencePeriod(absenceData.start_date, absenceData.end_date, absenceData.start_slot, absenceData.end_slot) : { text: '', date: '' }
  );
  
  function close() {
    onclose?.();
  }
  
  function handleModalClick(event) {
    if (event.target === event.currentTarget) {
      close();
    }
  }
</script>

{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="fixed bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
    style="top: 0; left: 0; right: 0; bottom: 0; margin: 0;"
    onclick={handleModalClick}
    transition:fade={{ duration: 200 }}
  >
    <!-- Modal Content -->
    <div 
      class="bg-gradient-to-br from-slate-800/95 via-slate-900/98 to-slate-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-700/50 mb-4"
      transition:fly={{ y: 50, duration: 300 }}
    >
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
          <svg class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-transparent bg-gradient-to-r from-white to-slate-200 bg-clip-text">Absence de {memberName}</h3>
      </div>
      
      <div class="mb-6">
        <p class="text-slate-200 text-center text-base">
          {formattedPeriod.text}<span class="font-semibold text-orange-300">{formattedPeriod.date}</span>
        </p>
      </div>
      
      <div class="flex justify-end">
        <button 
          onclick={close} 
          class="px-4 py-2 text-slate-200 hover:text-white bg-gradient-to-r from-slate-700/70 to-slate-600/70 backdrop-blur-sm rounded-lg hover:from-slate-600/80 hover:to-slate-500/80 transition-all duration-300 border border-slate-500/40"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
{/if}