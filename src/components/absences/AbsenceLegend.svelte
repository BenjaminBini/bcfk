<script>
  import { getIcon } from '../../lib/icons.js';

  const sunIcon = getIcon('sun');
  const moonIcon = getIcon('moon');
</script>

<div class="flex items-center gap-4 mb-4 text-xs text-slate-400">
  <div class="flex items-center gap-1">
    <svg class="w-3.5 h-3.5 text-amber-400" viewBox={sunIcon.viewBox} fill={sunIcon.fill}>
      <path d={sunIcon.path} />
    </svg>
    <span>Ouverture</span>
  </div>
  <div class="flex items-center gap-1">
    <svg class="w-3.5 h-3.5 text-indigo-400" viewBox={moonIcon.viewBox} fill={moonIcon.fill}>
      <path d={moonIcon.path} />
    </svg>
    <span>Fermeture</span>
  </div>
</div>
