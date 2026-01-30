<script>
  import { getIcon } from '../../lib/icons.js';

  const sunIcon = getIcon('sun');
  const moonIcon = getIcon('moon');
</script>

<div class="p-3 md:p-4 mb-4 rounded-lg bg-gradient-to-br from-slate-700/40 to-slate-600/40 border border-slate-600/40">
  <h4 class="text-xs md:text-sm font-semibold text-slate-300 mb-2">Légende :</h4>
  <div class="flex flex-wrap gap-4 text-xs md:text-sm">
    <div class="flex items-center gap-2">
      <svg class="w-4 h-4 text-amber-400" viewBox={sunIcon.viewBox} fill={sunIcon.fill}>
        <path d={sunIcon.path} />
      </svg>
      <span class="text-slate-300">Ouverture</span>
    </div>
    <div class="flex items-center gap-2">
      <svg class="w-4 h-4 text-indigo-400" viewBox={moonIcon.viewBox} fill={moonIcon.fill}>
        <path d={moonIcon.path} />
      </svg>
      <span class="text-slate-300">Fermeture</span>
    </div>
  </div>
</div>
