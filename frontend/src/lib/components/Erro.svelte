<script>
  import Botao from './Botao.svelte';
  import { API_URL } from '../util.js';
  import { dados, carregar } from '../dados.svelte.js';
</script>

<div class="col-span-full max-w-[560px] py-9">
  <h2 class="font-display text-[44px] leading-none font-extrabold">Não foi possível ligar à API</h2>
  <p class="mt-3 mb-5 text-tinta-2">
    O servidor em {API_URL} não respondeu ({dados.erro}). Se estava parado, pode demorar até um minuto a acordar. Espera um pouco e tenta de novo.
  </p>
  <Botao onclick={carregar}>Tentar de novo</Botao>
</div>
