<script>
  import Router from "svelte-spa-router";
  import { link, location } from "svelte-spa-router";
  import HomePage from "./pages/HomePage.svelte";
  import AssignmentsPage from "./pages/AssignmentsPage.svelte";
  import AbsencesPage from "./pages/AbsencesPage.svelte";
  import LegendModal from "./components/LegendModal.svelte";
  import { showLegendModal } from "./stores/legend.js";

  const routes = {
    "/": HomePage,
    "/assignments": AssignmentsPage,
    "/absences": AbsencesPage,
  };
</script>

<div class="overflow-hidden relative min-h-screen bg-slate-900 dark">
  <!-- Background elements -->

  <!-- Navigation -->
  <nav
    class="relative bg-gradient-to-r border-b shadow-2xl backdrop-blur-xl from-slate-800/90 to-slate-900/90 border-slate-700/50"
  >
    <div class="flex justify-start px-4 mx-auto max-w-7xl h-16 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center w-full sm:justify-start sm:w-auto">
        <h1
          class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200 shrink-0 no-wrap"
        >
          Planning BCFK
        </h1>

          <div class="flex flex-col justify-center items-center sm:hidden" >
            <button
              class="flex justify-center items-center p-1 pr-0 w-8 h-8 bg-gradient-to-r rounded-full border shadow-lg backdrop-blur-sm transition-all duration-300 m from-slate-600/80 to-slate-700/80 hover:from-slate-500/90 hover:to-slate-600/90 focus:outline-none focus:ring-2 focus:ring-slate-500/50 shadow-slate-500/25 hover:shadow-slate-500/40 hover:scale-110 border-slate-400/30 md:hidden"
              on:click={() => showLegendModal.set(true)}
              title="Légende"
              aria-label="Ouvrir la légende"
            >
              <svg
                xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                xmlns:ns1="http://sozi.baierouge.fr"
                xmlns:cc="http://web.resource.org/cc/"
                xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                id="svg1"
                viewBox="0 0 60 60"
                _SVGFile__filename="oldscale/apps/gnome_question.svg"
                version="1.0"
                y="0"
                x="0"
              >
                <g
                  id="g1088"
                  transform="matrix(.98664 .26437 -.26437 .98664 4.8396 -7.1028)"
                >
                  <path
                    id="path1710"
                    style="stroke-linejoin:round;stroke:#ffffff;stroke-linecap:round;stroke-width:2;fill:none"
                    d="m29.336 3.125c2.312 0 4.508 0.3544 6.512 1.0368 2.003 0.6825 3.767 1.6652 5.308 2.9862 1.542 1.3209 2.75 2.918 3.609 4.811 0.88 1.871 1.285 3.992 1.285 6.304 0 4.139-1.019 7.332-3.11 9.622-2.07 2.267-4.911 3.772-8.544 4.52v1.328c0 1.056-0.243 2.005-0.705 2.82-0.44 0.792-1.093 1.404-1.908 1.866-0.792 0.44-1.683 0.664-2.695 0.664-1.013 0-1.923-0.224-2.738-0.664-0.792-0.462-1.404-1.074-1.866-1.866-0.44-0.815-0.664-1.764-0.664-2.82v-5.433c0-1.123 0.202-2.019 0.664-2.613 0.462-0.595 1.04-0.983 1.7-1.203 0.661-0.22 1.666-0.463 2.987-0.705 3.434-0.639 5.142-2.366 5.142-5.184 0-1.145-0.485-2.167-1.41-3.069-0.902-0.925-2.092-1.369-3.567-1.369-1.365 0-2.442 0.26-3.235 0.788-0.77 0.528-1.51 1.31-2.281 2.323-0.748 0.99-1.493 1.752-2.198 2.281-0.682 0.506-1.631 0.746-2.82 0.746-1.343 0-2.474-0.522-3.442-1.534-0.947-1.035-1.41-2.222-1.41-3.609 0-2.421 0.779-4.559 2.364-6.3866 1.585-1.8272 3.553-3.2202 5.93-4.1888 2.378-0.9687 4.737-1.4516 7.092-1.4516zm-0.331 41.847c1.034 0 2 0.279 2.903 0.83 0.902 0.55 1.587 1.273 2.115 2.198 0.55 0.902 0.829 1.888 0.829 2.944 0 1.079-0.279 2.103-0.829 3.028-0.528 0.902-1.232 1.587-2.157 2.115-0.902 0.528-1.849 0.788-2.861 0.788-1.013 0-1.979-0.26-2.904-0.788-0.902-0.528-1.647-1.213-2.198-2.115-0.528-0.925-0.788-1.949-0.788-3.028 0-1.056 0.26-2.042 0.788-2.944 0.551-0.925 1.296-1.648 2.198-2.198 0.903-0.551 1.869-0.83 2.904-0.83z"
                  />
                  <path
                    id="path839"
                    style="fill-rule:evenodd;fill:#FFFFFF00"
                    d="m29.336 3.125c2.312 0 4.508 0.3544 6.512 1.0368 2.003 0.6825 3.767 1.6652 5.308 2.9862 1.542 1.3209 2.75 2.918 3.609 4.811 0.88 1.871 1.285 3.992 1.285 6.304 0 4.139-1.019 7.332-3.11 9.622-2.07 2.267-4.911 3.772-8.544 4.52v1.328c0 1.056-0.243 2.005-0.705 2.82-0.44 0.792-1.093 1.404-1.908 1.866-0.792 0.44-1.683 0.664-2.695 0.664-1.013 0-1.923-0.224-2.738-0.664-0.792-0.462-1.404-1.074-1.866-1.866-0.44-0.815-0.664-1.764-0.664-2.82v-5.433c0-1.123 0.202-2.019 0.664-2.613 0.462-0.595 1.04-0.983 1.7-1.203 0.661-0.22 1.666-0.463 2.987-0.705 3.434-0.639 5.142-2.366 5.142-5.184 0-1.145-0.485-2.167-1.41-3.069-0.902-0.925-2.092-1.369-3.567-1.369-1.365 0-2.442 0.26-3.235 0.788-0.77 0.528-1.51 1.31-2.281 2.323-0.748 0.99-1.493 1.752-2.198 2.281-0.682 0.506-1.631 0.746-2.82 0.746-1.343 0-2.474-0.522-3.442-1.534-0.947-1.035-1.41-2.222-1.41-3.609 0-2.421 0.779-4.559 2.364-6.3866 1.585-1.8272 3.553-3.2202 5.93-4.1888 2.378-0.9687 4.737-1.4516 7.092-1.4516zm-0.331 41.847c1.034 0 2 0.279 2.903 0.83 0.902 0.55 1.587 1.273 2.115 2.198 0.55 0.902 0.829 1.888 0.829 2.944 0 1.079-0.279 2.103-0.829 3.028-0.528 0.902-1.232 1.587-2.157 2.115-0.902 0.528-1.849 0.788-2.861 0.788-1.013 0-1.979-0.26-2.904-0.788-0.902-0.528-1.647-1.213-2.198-2.115-0.528-0.925-0.788-1.949-0.788-3.028 0-1.056 0.26-2.042 0.788-2.944 0.551-0.925 1.296-1.648 2.198-2.198 0.903-0.551 1.869-0.83 2.904-0.83z"
                  />
                </g>
              </svg>
            </button>
            <div class="mt-1 w-full text-xs text-center text-white/80">
              Aide
            </div>
          </div>
      </div>
      <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
        <a
          href="/"
          use:link
          class="inline-flex items-center border-b-2 px-4 pt-1 text-sm font-medium rounded-t-lg transition-all duration-300 {$location ===
          '/'
            ? 'border-indigo-400 text-white bg-gradient-to-t from-indigo-500/10 to-transparent'
            : 'border-transparent text-slate-300 hover:border-slate-400 hover:text-white hover:bg-gradient-to-t hover:from-slate-700/20 hover:to-transparent'}"
        >
          Semaine Actuelle
        </a>
        <a
          href="/assignments"
          use:link
          class="inline-flex items-center border-b-2 px-4 pt-1 text-sm font-medium rounded-t-lg transition-all duration-300 {$location ===
          '/assignments'
            ? 'border-indigo-400 text-white bg-gradient-to-t from-indigo-500/10 to-transparent'
            : 'border-transparent text-slate-300 hover:border-slate-400 hover:text-white hover:bg-gradient-to-t hover:from-slate-700/20 hover:to-transparent'}"
        >
          Gestion Affectations
        </a>
        <a
          href="/absences"
          use:link
          class="inline-flex items-center border-b-2 px-4 pt-1 text-sm font-medium rounded-t-lg transition-all duration-300 {$location ===
          '/absences'
            ? 'border-indigo-400 text-white bg-gradient-to-t from-indigo-500/10 to-transparent'
            : 'border-transparent text-slate-300 hover:border-slate-400 hover:text-white hover:bg-gradient-to-t hover:from-slate-700/20 hover:to-transparent'}"
        >
          Gestion Absences
        </a>
      </div>
    </div>
  </nav>

  <!-- Main content -->
  <main class="relative">
    <Router {routes} />
  </main>

  <!-- Legend Modal -->
  <LegendModal
    show={$showLegendModal}
    onClose={() => showLegendModal.set(false)}
  />
</div>
