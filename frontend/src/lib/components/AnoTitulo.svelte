<script>
  // "1º ano" em tipo grande; o tamanho do número muda de página para página
  let { ano, numClass = 'text-[80px] pequeno:text-[60px]', ordClass = 'text-[22px]', rotuloClass = 'text-[15px]' } = $props();
</script>

<span class="flex items-end gap-0.5 font-normal" aria-hidden="true">
  <span class="font-display font-extrabold leading-[0.8] {numClass}">{ano}</span>
  <span class="mt-1 self-start font-texto font-bold leading-none {ordClass}">º</span>
  <span class="mr-0 mb-[3px] ml-2 font-texto font-medium leading-none text-tinta-2 {rotuloClass}">ano</span>
</span>
