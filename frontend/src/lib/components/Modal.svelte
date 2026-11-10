<script>
  // Diálogo nativo (<dialog>): foca, fecha com Esc e bloqueia o resto da página
  let { titulo, children } = $props();
  const id = $props.id();
  let dialogo;

  export function abrir() {
    dialogo.showModal();
  }
  export function fechar() {
    dialogo.close();
  }
</script>

<!-- Clicar no fundo escurecido fecha o diálogo (o teclado já fecha com Esc) -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialogo}
  aria-labelledby="{id}-titulo"
  onclick={(e) => { if (e.target === dialogo) dialogo.close(); }}
  class="m-auto w-[min(520px,calc(100vw-32px))] overflow-hidden rounded-xl border-0 bg-folha p-0 text-tinta backdrop:bg-tinta/60"
>
  <div class="border-t-[6px] border-tinta p-7 pequeno:p-[22px]">
    <h2 id="{id}-titulo" class="mb-5 font-display text-[44px] leading-none font-extrabold">{titulo}</h2>
    {@render children()}
  </div>
</dialog>
