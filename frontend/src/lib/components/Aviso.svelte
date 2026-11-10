<script>
  import { aviso } from '../dados.svelte.js';
</script>

<div
  role="status"
  aria-live="polite"
  class="pointer-events-none fixed bottom-4 left-4 z-20 max-w-[min(440px,calc(100vw-32px))] rounded-lg px-4 py-3 text-[15px] leading-snug font-semibold transition-[opacity,transform] duration-200 print:hidden
    {aviso.erro ? 'bg-perigo' : 'bg-tinta'} text-papel
    {aviso.visivel ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}"
>
  {aviso.texto}
</div>
