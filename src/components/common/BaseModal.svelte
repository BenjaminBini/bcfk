<script>
  import { fly, fade } from "svelte/transition";

  /**
   * @typedef {Object} Props
   * @property {boolean} isOpen - Whether modal is open
   * @property {function} onClose - Function to close modal
   * @property {'sm'|'md'|'lg'} [size='md'] - Modal size
   * @property {'default'|'danger'|'success'} [variant='default'] - Color theme
   * @property {boolean} [showCloseButton=false] - Show close X button
   * @property {boolean} [closeOnEscape=true] - Allow ESC to close
   * @property {boolean} [closeOnBackdrop=true] - Allow backdrop click to close
   * @property {boolean} [usePortal=false] - Render in document.body
   */

  /** @type {Props} */
  let {
    isOpen = false,
    onClose,
    size = "md",
    variant = "default",
    showCloseButton = false,
    closeOnEscape = true,
    closeOnBackdrop = true,
    usePortal = false,
    children,
  } = $props();

  // Size configurations
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
  };

  // Variant configurations
  const variantClasses = {
    default: {
      modal:
        "bg-gradient-to-br from-slate-800/95 via-slate-900/98 to-slate-800/95 border-slate-700/50",
      backdrop: "bg-black/60",
    },
    danger: {
      modal:
        "bg-gradient-to-br from-slate-800/95 via-slate-900/98 to-slate-800/95 border-orange-500/30",
      backdrop: "bg-black/60",
    },
    success: {
      modal:
        "bg-gradient-to-br from-slate-800/95 via-slate-900/98 to-slate-800/95 border-emerald-500/30",
      backdrop: "bg-black/60",
    },
  };

  // Portal action to move modal to document.body
  function portal(node) {
    if (!usePortal) return {};

    const target = document.body;
    target.appendChild(node);

    return {
      destroy() {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      },
    };
  }

  function handleClose() {
    onClose?.();
  }

  function handleBackdropClick(event) {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      handleClose();
    }
  }

  function handleKeydown(event) {
    if (closeOnEscape && event.key === "Escape") {
      handleClose();
    }
  }

  // Set up keyboard event listener
  $effect(() => {
    if (isOpen && closeOnEscape) {
      document.addEventListener("keydown", handleKeydown);
      return () => {
        document.removeEventListener("keydown", handleKeydown);
      };
    }
  });
</script>

{#if isOpen}
  <div
    use:portal
    class="fixed z-50 flex items-center justify-center backdrop-blur-sm {variantClasses[
      variant
    ].backdrop}"
    style="top: 0; left: 0; right: 0; bottom: 0; margin: 0;"
    onclick={handleBackdropClick}
    onkeydown={(e) => e.key === "Enter" && handleBackdropClick(e)}
    role="dialog"
    aria-modal="true"
    tabindex="0"
    transition:fade={{ duration: 200 }}
  >
    <div
      class="w-full mx-4 rounded-2xl p-6 shadow-2xl border backdrop-blur-xl {sizeClasses[
        size
      ]} {variantClasses[variant].modal}"
      role="document"
      transition:fly={{ y: 50, duration: 300 }}
    >
      {#if showCloseButton}
        <div class="flex justify-end mb-4">
          <button
            aria-label="Fermer"
            onclick={handleClose}
            class="flex items-center justify-center w-8 h-8 transition-all duration-300 border rounded-full bg-slate-800/90 hover:bg-slate-700/90 text-slate-400 hover:text-white border-slate-600/50"
            title="Fermer"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      {/if}

      {#if children?.icon || children?.header || children?.content || children?.actions}
        {#if children?.icon || children?.header}
          <div class="flex items-center mb-4 space-x-3">
            {#if children?.icon}
              {@render children.icon?.()}
            {/if}
            {#if children?.header}
              <div class="flex-1">
                {@render children.header?.()}
              </div>
            {/if}
          </div>
        {/if}

        {#if children?.content}
          <div class="mb-6">
            {@render children.content?.()}
          </div>
        {/if}

        {#if children?.actions}
          <div class="flex justify-end space-x-3">
            {@render children.actions?.()}
          </div>
        {/if}
      {:else}
        {@render children?.()}
      {/if}
    </div>
  </div>
{/if}
