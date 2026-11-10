<script>
  import Alunos from './pages/Alunos.svelte';
  import Matriz from './pages/Matriz.svelte';
  import Aviso from './lib/components/Aviso.svelte';
  import { carregar } from './lib/dados.svelte.js';

  // Duas páginas, escolhidas pelo endereço (#/ = alunos, #/matriz = matriz)
  const rotaAtual = () => (location.hash.startsWith('#/matriz') ? 'matriz' : 'alunos');
  let rota = $state(rotaAtual());

  $effect(() => {
    document.title = rota === 'matriz' ? 'Matriz de alunos' : 'Gestão de alunos';
  });

  carregar();
</script>

<svelte:window onhashchange={() => { rota = rotaAtual(); window.scrollTo(0, 0); }} />

{#if rota === 'matriz'}
  <Matriz />
{:else}
  <Alunos />
{/if}

<Aviso />
