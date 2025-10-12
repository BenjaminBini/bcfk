<script>
  import { isCurrentDate } from "../../lib/dateUtils";

  let { date, navigationDirection = "next", dateKey } = $props();

  console.log(date);
  let isToday = isCurrentDate(date);
</script>

<div
  class="overflow-hidden relative h-full outline-1 outline-slate-400/20 bg-gradient-to-b
  {isToday
    ? 'from-blue-600/40 to-blue-500/10 border-l-2 border-r-2 border-blue-400/50'
    : 'from-slate-800/80 to-slate-900/80'}"
>
  <div
    class="flex flex-col justify-center items-center h-full text-center py-2 md:py-4 min-w-[50px] md:min-w-[132px]"
  >
    <!-- Static day name -->
    <div
      class="text-sm font-semibold capitalize md:text-lg"
      class:text-white={!isToday}
      class:text-blue-300={isToday}
      class:drop-shadow-sm={isToday}
    >
      {date.toLocaleDateString("fr-FR", { weekday: "long" })}
    </div>

    <!-- Animated date -->
    {#if date}
      <div class="relative w-full">
        {#key dateKey}
          <div
            class="absolute inset-0 flex items-center justify-center text-xs md:text-sm"
            class:text-gray-300={!isToday}
            class:text-blue-100={isToday}
            in:fly={{
              x: navigationDirection === "next" ? 200 : -200,
              duration: 300,
            }}
            out:fly={{
              x: navigationDirection === "next" ? -200 : 200,
              duration: 300,
            }}
          >
            {date.getDate()}
            {date.toLocaleDateString("fr-FR", { month: "long" })}
          </div>
        {/key}
        <!-- Invisible placeholder to maintain height and width -->
        <div class="invisible text-xs md:text-sm">
          {date.getDate()}
          {date.toLocaleDateString("fr-FR", { month: "long" })}
        </div>
      </div>
    {/if}
  </div>
</div>
