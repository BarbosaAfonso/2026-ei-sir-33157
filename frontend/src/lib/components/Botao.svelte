<script>
  // Botão (ou ligação, se tiver href) com as três variantes do desenho
  let { variante = 'primario', href, class: extra = '', children, ...resto } = $props();

  const base =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap min-h-11 px-5 border-[1.5px] rounded-md font-texto font-bold text-[15.5px] leading-none no-underline cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-progress';

  const variantes = {
    primario: 'border-tinta bg-tinta text-papel enabled:hover:bg-[#0E2923]',
    secundario: 'border-tinta bg-transparent text-tinta hover:bg-tinta/8',
    perigo: 'border-perigo bg-perigo text-white enabled:hover:bg-[#8F1D17]'
  };
</script>

{#if href}
  <a {href} class="{base} {variantes[variante]} {extra}" {...resto}>{@render children?.()}</a>
{:else}
  <button type="button" class="{base} {variantes[variante]} {extra}" {...resto}>{@render children?.()}</button>
{/if}
