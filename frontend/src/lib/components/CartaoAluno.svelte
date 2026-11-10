<script>
  import Forma from './Forma.svelte';
  import { arrasto } from '../dados.svelte.js';
  import { corCurso, indiceCurso } from '../util.js';

  let { aluno, cursos, novo = false, oneditar, onapagar } = $props();

  const i = $derived(indiceCurso(cursos, aluno.idCurso));
  const nomeCurso = $derived(i < 0 ? 'Sem curso' : cursos[i].nomeDoCurso);
  const nomeCompleto = $derived(`${aluno.nome} ${aluno.apelido}`);

  let aArrastar = $state(false);

  function inicioArrasto(e) {
    arrasto.id = aluno.id;
    e.dataTransfer.setData('text/plain', String(aluno.id));
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => (aArrastar = true), 0);
  }

  function fimArrasto() {
    arrasto.id = null;
    aArrastar = false;
  }

  const botaoIcone =
    'inline-flex size-9 items-center justify-center rounded-sm border-0 bg-transparent text-tinta-2';
</script>

<li
  draggable="true"
  ondragstart={inicioArrasto}
  ondragend={fimArrasto}
  style="--c: {corCurso(i)}"
  class="group grid cursor-grab grid-cols-[1fr_auto] gap-x-2 rounded-md border border-l-[5px] border-linha border-l-(color:--c) bg-folha py-[11px] pr-2 pl-3.5 hover:border-tinta hover:border-l-(color:--c)
    {aArrastar ? 'opacity-40' : ''} {novo ? 'animate-pouso' : ''}"
>
  <p class="col-start-1 text-[17px] leading-tight font-bold [overflow-wrap:anywhere]">{nomeCompleto}</p>

  <div class="col-start-2 row-span-2 row-start-1 flex items-start gap-0.5 opacity-60 group-focus-within:opacity-100 group-hover:opacity-100 sem-hover:opacity-100">
    <button type="button" title="Editar" aria-label="Editar {nomeCompleto}" class="{botaoIcone} hover:bg-tinta/10 hover:text-tinta" onclick={() => oneditar(aluno)}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
    </button>
    <button type="button" title="Apagar" aria-label="Apagar {nomeCompleto}" class="{botaoIcone} hover:bg-perigo/12 hover:text-perigo" onclick={() => onapagar(aluno)}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
    </button>
  </div>

  <p class="col-start-1 mt-1 flex items-center gap-2 text-sm leading-snug"><Forma {i} />{nomeCurso}</p>
  <p class="col-start-1 mt-0.5 text-[13px] text-tinta-2 tabular-nums">n.º {aluno.id}</p>
</li>
