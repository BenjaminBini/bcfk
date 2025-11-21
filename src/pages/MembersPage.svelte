<script>
  import { onMount } from "svelte";
  import { api } from "../lib/api.js";
  import { showToast } from "../stores/toast.js";
  import PageHeader from "../components/layout/PageHeader.svelte";
  import ContentWrapper from "../components/layout/ContentWrapper.svelte";
  import MemberFormModal from "../components/members/MemberFormModal.svelte";
  import Icon from "../components/common/Icon.svelte";

  let members = $state([]);
  let isLoading = $state(false);
  let error = $state(null);
  let isModalOpen = $state(false);
  let editingMember = $state(null);

  onMount(async () => {
    await loadMembers();
  });

  async function loadMembers() {
    isLoading = true;
    error = null;
    try {
      members = await api.getMembers();
    } catch (err) {
      console.error("Error loading members:", err);
      error = "Échec du chargement des membres";
      showToast("Échec du chargement des membres", "error");
    } finally {
      isLoading = false;
    }
  }

  function handleAddMember() {
    editingMember = null;
    isModalOpen = true;
  }

  function handleEditMember(member) {
    editingMember = member;
    isModalOpen = true;
  }

  function handleCloseModal() {
    isModalOpen = false;
    editingMember = null;
  }

  async function handleFormSubmit(event) {
    const { name, isEdit, memberId } = event.detail;

    if (!name || !name.trim()) {
      showToast("Le nom est requis", "error");
      return;
    }

    try {
      if (isEdit) {
        await api.updateMember(memberId, { name });
        showToast("Membre mis à jour avec succès", "success");
      } else {
        await api.addMember({ name });
        showToast("Membre ajouté avec succès", "success");
      }

      await loadMembers();
      handleCloseModal();
    } catch (err) {
      console.error("Error saving member:", err);
      showToast(
        isEdit ? "Échec de la mise à jour du membre" : "Échec de l'ajout du membre",
        "error"
      );
    }
  }
</script>

<div class="py-4 md:py-10">
  <div class="px-2 mx-auto max-w-7xl sm:px-4 md:px-6 lg:px-8">
    <!-- Page header -->
    <PageHeader title="Membres" subtitle="Gérer les membres de l'association" />

    <!-- Add button -->
    <div class="mt-4 md:mt-6">
      <button
        onclick={handleAddMember}
        class="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Icon name="plus" size="w-5 h-5" className="mr-2" />
        Ajouter un membre
      </button>
    </div>

    <!-- Content -->
    <div class="mt-4 md:mt-6">
      <ContentWrapper {isLoading} {error}>
        {#if members.length === 0}
          <div class="py-12 text-center">
            <p class="text-slate-400">Aucun membre trouvé</p>
            <button
              onclick={handleAddMember}
              class="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-white transition-colors bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700"
            >
              <Icon name="plus" size="w-5 h-5" className="mr-2" />
              Ajouter le premier membre
            </button>
          </div>
        {:else}
          <div class="overflow-hidden bg-slate-800/50 backdrop-blur-sm rounded-xl ring-1 ring-slate-700/50">
            <table class="min-w-full divide-y divide-slate-700">
              <thead class="bg-slate-800/80">
                <tr>
                  <th
                    scope="col"
                    class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-200 sm:pl-6"
                  >
                    Prénom
                  </th>
                  <th
                    scope="col"
                    class="px-3 py-3.5 text-left text-sm font-semibold text-slate-200"
                  >
                    Nom
                  </th>
                  <th
                    scope="col"
                    class="px-3 py-3.5 text-left text-sm font-semibold text-slate-200"
                  >
                    Nom complet
                  </th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-700/50 bg-slate-800/30">
                {#each members as member (member.id)}
                  <tr class="transition-colors hover:bg-slate-700/30">
                    <td
                      class="py-4 pl-4 pr-3 text-sm font-medium whitespace-nowrap text-slate-200 sm:pl-6"
                    >
                      {member.first_name}
                    </td>
                    <td class="px-3 py-4 text-sm whitespace-nowrap text-slate-300">
                      {member.last_name || '-'}
                    </td>
                    <td class="px-3 py-4 text-sm whitespace-nowrap text-slate-300">
                      {member.full_name}
                    </td>
                    <td
                      class="relative py-4 pl-3 pr-4 text-sm font-medium text-right whitespace-nowrap sm:pr-6"
                    >
                      <button
                        onclick={() => handleEditMember(member)}
                        class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-400 transition-colors rounded-lg hover:text-indigo-300 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Icon name="pencil" size="w-4 h-4" className="mr-1.5" />
                        Modifier
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </ContentWrapper>
    </div>
  </div>
</div>

<!-- Member Form Modal -->
{#if isModalOpen}
  <MemberFormModal
    member={editingMember}
    onClose={handleCloseModal}
    onSubmit={handleFormSubmit}
  />
{/if}
