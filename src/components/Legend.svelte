<script>
  import AbsentMemberTag from "./AbsentMemberTag.svelte";
  import RecurrentMemberTag from "./RecurrentMemberTag.svelte";
  import SpecificDateMemberTag from "./SpecificDateMemberTag.svelte";
  import AddMemberButton from "./AddMemberButton.svelte";
  import { getIcon } from "../lib/icons";
</script>

<!-- Compact Legend Panel -->
<div
  class="flex relative justify-center items-center p-4 mb-6 bg-gradient-to-r rounded-lg border backdrop-blur-sm border-slate-700"
>
  <div class="overflow-hidden absolute top-0 right-4 p-1 px-2 mb-px text-xs rounded-t-lg -translate-y-full bg-slate-800 text-white/50">Légende</div>
  <div class="flex flex-wrap gap-6 justify-center text-sm">
    <!-- Member Tags -->
    <div class="flex gap-2 items-center">
      <RecurrentMemberTag text="Benjamin" tooltip="Membre" />
      <span class="text-slate-400">Assigné au créneau</span>
    </div>
    <div class="flex gap-2 items-center">
      <AbsentMemberTag text="Christian" tooltip="Absent" />
      <span class="text-slate-400">Absent</span>
    </div>
    <div class="flex gap-2 items-center">
      <SpecificDateMemberTag text="Bruno" tooltip="Spécifique" />
      <span class="text-slate-400">Présence ponctuelle</span>
    </div>
    <div class="flex gap-2 items-center">
      <AddMemberButton text="Inscription" tooltip="Ajouter" />
      <span class="text-slate-400">Inscription</span>
    </div>
    <div class="flex gap-2 items-center">
      <button aria-label="Déclarer une absence"
        class="flex overflow-hidden justify-end items-center py-1 pr-1.5 pl-2 text-white bg-gradient-to-tr to-orange-700 rounded-r-full from-orange-400/100 focus:outline-none fright-0"
        title="Inscription"
      >
        <svg
          class="flex-shrink-0 w-4 h-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d={getIcon("plane").path} />
        </svg>
      </button>
      <span class="text-slate-400">Déclarer une absence</span>
    </div>
    <div class="flex gap-2 items-center">
      
      <button aria-label="Inscription"
        class="flex overflow-hidden justify-end items-center py-1 pr-1.5 pl-2 text-white bg-gradient-to-tr from-red-500 to-red-600 rounded-r-full focus:outline-none fright-0"
        title="Inscription"
      >
        <svg
          class="flex-shrink-0 w-4 h-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
            <path fill-rule="evenodd" d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" clip-rule="evenodd" />
        </svg>
      </button>
      <span class="text-slate-400">Supprimer</span>
    </div>
  </div>
</div>
