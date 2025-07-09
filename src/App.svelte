<script>
  import Router from 'svelte-spa-router';
  import { link, location } from 'svelte-spa-router';
  import HomePage from './pages/HomePage.svelte';
  import AssignmentsPage from './pages/AssignmentsPage.svelte';
  import AbsencesPage from './pages/AbsencesPage.svelte';

  const routes = {
    '/': HomePage,
    '/assignments': AssignmentsPage,
    '/absences': AbsencesPage
  };

</script>

<div class="min-h-screen bg-slate-900 dark relative overflow-hidden">
  <!-- Background elements -->

  <!-- Navigation -->
  <nav class="relative bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-xl shadow-2xl border-b border-slate-700/50">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 justify-between">
        <div class="flex">
          <div class="flex flex-shrink-0 items-center">
            <h1 class="text-xl font-bold text-transparent bg-gradient-to-r from-white to-slate-200 bg-clip-text">Planning BCFK</h1>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <a href="/" use:link class="inline-flex items-center border-b-2 px-4 pt-1 text-sm font-medium rounded-t-lg transition-all duration-300 {$location === '/' ? 'border-indigo-400 text-white bg-gradient-to-t from-indigo-500/10 to-transparent' : 'border-transparent text-slate-300 hover:border-slate-400 hover:text-white hover:bg-gradient-to-t hover:from-slate-700/20 hover:to-transparent'}">
              Semaine Actuelle
            </a>
            <a href="/assignments" use:link class="inline-flex items-center border-b-2 px-4 pt-1 text-sm font-medium rounded-t-lg transition-all duration-300 {$location === '/assignments' ? 'border-indigo-400 text-white bg-gradient-to-t from-indigo-500/10 to-transparent' : 'border-transparent text-slate-300 hover:border-slate-400 hover:text-white hover:bg-gradient-to-t hover:from-slate-700/20 hover:to-transparent'}">
              Gestion Affectations
            </a>
            <a href="/absences" use:link class="inline-flex items-center border-b-2 px-4 pt-1 text-sm font-medium rounded-t-lg transition-all duration-300 {$location === '/absences' ? 'border-indigo-400 text-white bg-gradient-to-t from-indigo-500/10 to-transparent' : 'border-transparent text-slate-300 hover:border-slate-400 hover:text-white hover:bg-gradient-to-t hover:from-slate-700/20 hover:to-transparent'}">
              Gestion Absences
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <!-- Main content -->
  <main class="relative">
    <Router {routes} />
  </main>
</div>