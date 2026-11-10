<script>
  import AnoTitulo from './AnoTitulo.svelte';
  import CartaoAluno from './CartaoAluno.svelte';
  import { arrasto } from '../dados.svelte.js';
  import { plural } from '../util.js';

  let { ano, lista, filtrado, cursos, destacado, onmover, onnovo, oneditar, onapagar } = $props();

  let alvo = $state(false);

  function sobre(e) {
    if (arrasto.id == null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    alvo = true;
  }

  function saiu(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) alvo = false;
  }

  function largou(e) {
    if (arrasto.id == null) return;
    e.preventDefault();
    const id = arrasto.id;
    arrasto.id = null;
    alvo = false;
    onmover(id, ano);
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<section
  aria-labelledby="ano-{ano}"
  ondragover={sobre}
  ondragleave={saiu}
  ondrop={largou}
  class="flex min-h-[380px] min-w-0 flex-col gap-3.5 border-l border-linha px-[18px] pb-7 first:border-l-0 first:pl-0 last:pr-0
    medio:min-h-0 medio:border-l-0! medio:px-0! medio:pb-6
    pequeno:border-t pequeno:border-linha pequeno:first:border-t-0
    {alvo ? 'bg-ambar/18 outline-2 -outline-offset-6 outline-tinta outline-dashed' : ''}"
>
  <header class="flex items-end justify-between gap-2 pt-3.5">
    <h2 id="ano-{ano}" aria-label="{ano}º ano"><AnoTitulo {ano} /></h2>
    <p class="pb-1 text-sm text-tinta-2 tabular-nums">{plural(lista.length, 'aluno', 'alunos')}</p>
  </header>
  <div class="regua" aria-hidden="true"></div>

  {#if lista.length}
    <ul class="grid list-none gap-2.5">
      {#each lista as aluno (aluno.id)}
        <CartaoAluno {aluno} {cursos} novo={String(aluno.id) === String(destacado)} {oneditar} {onapagar} />
      {/each}
    </ul>
  {:else}
    <p class="text-[15px] text-tinta-2">
      {filtrado ? `Nenhum aluno deste curso no ${ano}º ano.` : `Nenhum aluno no ${ano}º ano.`}
    </p>
    <button
      type="button"
      onclick={() => onnovo(ano)}
      class="min-h-9 self-start border-0 border-b-[1.5px] border-tinta bg-transparent px-0.5 font-texto text-[15px] leading-none font-bold text-tinta hover:bg-ambar/25"
    >Adicionar aluno</button>
  {/if}
</section>
