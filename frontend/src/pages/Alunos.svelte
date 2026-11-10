<script>
  import Botao from '../lib/components/Botao.svelte';
  import Forma from '../lib/components/Forma.svelte';
  import AnoTitulo from '../lib/components/AnoTitulo.svelte';
  import Coluna from '../lib/components/Coluna.svelte';
  import Erro from '../lib/components/Erro.svelte';
  import AlunoDialog from '../lib/components/AlunoDialog.svelte';
  import CursoDialog from '../lib/components/CursoDialog.svelte';
  import ApagarDialog from '../lib/components/ApagarDialog.svelte';
  import { api } from '../lib/api.js';
  import { dados, mostrarAviso, resumoDeCarga } from '../lib/dados.svelte.js';
  import { ANOS_MINIMOS, anosDaTabela, indiceCurso, plural, porId } from '../lib/util.js';

  let filtroCurso = $state(''); // id do curso filtrado ('' = todos)
  let destacado = $state(null); // aluno que acabou de ser guardado ou movido
  let alunoDlg;
  let cursoDlg;
  let apagarDlg;

  const visiveis = $derived(
    dados.alunos.filter((a) => !filtroCurso || String(a.idCurso) === filtroCurso).toSorted(porId)
  );
  const anos = $derived(anosDaTabela(dados.alunos));

  const resumo = $derived.by(() => {
    const carga = resumoDeCarga();
    if (carga) return carga;
    if (filtroCurso) {
      const i = indiceCurso(dados.cursos, filtroCurso);
      const nome = i < 0 ? 'este curso' : dados.cursos[i].nomeDoCurso;
      return `${plural(visiveis.length, 'aluno', 'alunos')} em ${nome}`;
    }
    return `${plural(dados.alunos.length, 'aluno', 'alunos')} em ${plural(dados.cursos.length, 'curso', 'cursos')}`;
  });

  // A matriz envia para aqui um pedido para adicionar já com o curso e o ano preenchidos
  $effect(() => {
    if (dados.estado === 'ok' && dados.pedidoNovo) {
      const { curso, ano } = dados.pedidoNovo;
      dados.pedidoNovo = null;
      alunoDlg.abrir(null, ano, curso);
    }
  });

  async function mover(id, ano) {
    const aluno = dados.alunos.find((a) => String(a.id) === String(id));
    if (!aluno || Number(aluno.anoCurricular) === ano) return;

    const anterior = aluno.anoCurricular;
    aluno.anoCurricular = ano;
    destacado = aluno.id;

    try {
      await api(`/alunos/${aluno.id}`, {
        method: 'PUT',
        body: { nome: aluno.nome, apelido: aluno.apelido, idCurso: aluno.idCurso, anoCurricular: ano }
      });
      mostrarAviso(`${aluno.nome} ${aluno.apelido} passou para o ${ano}º ano.`);
    } catch (err) {
      aluno.anoCurricular = anterior;
      mostrarAviso(`Não foi possível mudar o ano: ${err.message}`, true);
    }
  }

  const chip =
    'inline-flex min-h-[38px] items-center gap-2 rounded-full border-[1.5px] border-tinta bg-folha px-3.5 font-texto text-[14.5px] leading-none font-semibold text-tinta not-aria-pressed:hover:bg-white aria-pressed:bg-tinta aria-pressed:text-papel';
</script>

<div class="mx-auto max-w-[1440px] px-8 pt-8 pb-14 pequeno:px-4 pequeno:pt-6">
  <header class="flex flex-wrap items-end justify-between gap-6">
    <div>
      <h1 class="font-display text-[clamp(64px,9vw,112px)] leading-[0.82] font-extrabold tracking-[-0.01em]">Alunos</h1>
      <p class="mt-3.5 text-lg font-semibold" aria-live="polite">{resumo}</p>
      <p class="mt-0.5 text-[15px] text-tinta-2">
        <span class="toque:hidden">Arrasta um aluno para outra coluna para mudar o ano curricular.</span>
        <span class="hidden toque:inline">Toca em Editar para mudar o ano curricular.</span>
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <a
        href="#/matriz"
        title="Ver a matriz por curso e ano"
        aria-label="Ver a matriz por curso e ano"
        class="inline-flex size-11 items-center justify-center rounded-md border-[1.5px] border-tinta font-display text-[22px] leading-none font-extrabold text-tinta no-underline hover:bg-tinta hover:text-papel"
      >#</a>
      <Botao variante="secundario" onclick={() => cursoDlg.abrir()}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 2v12M2 8h12"/></svg>
        Novo curso
      </Botao>
      <Botao onclick={() => alunoDlg.abrir(null)}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 2v12M2 8h12"/></svg>
        Novo aluno
      </Botao>
    </div>
  </header>

  {#if dados.estado === 'ok'}
    <div class="mt-8 mb-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar por curso">
      <button type="button" class={chip} aria-pressed={filtroCurso === ''} onclick={() => (filtroCurso = '')}>
        Todos <span class="font-medium tabular-nums opacity-75">{dados.alunos.length}</span>
      </button>
      {#each dados.cursos as c, i (c.id)}
        <button type="button" class={chip} aria-pressed={filtroCurso === String(c.id)} onclick={() => (filtroCurso = String(c.id))}>
          <Forma {i} />{c.nomeDoCurso}
          <span class="font-medium tabular-nums opacity-75">{dados.alunos.filter((a) => String(a.idCurso) === String(c.id)).length}</span>
        </button>
      {/each}
    </div>
  {:else}
    <div class="mt-8 mb-6 min-h-[38px]"></div>
  {/if}

  <main>
    <div
      aria-busy={dados.estado === 'a-carregar'}
      class="grid auto-cols-fr grid-flow-col border-t-2 border-tinta
        medio:grid-flow-row medio:auto-cols-auto medio:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] medio:gap-x-7
        pequeno:grid-cols-1"
    >
      {#if dados.estado === 'erro'}
        <Erro />
      {:else if dados.estado === 'a-carregar'}
        {#each { length: ANOS_MINIMOS } as _, k}
          <section aria-hidden="true" class="flex min-h-[380px] min-w-0 flex-col gap-3.5 border-l border-linha px-[18px] pb-7 first:border-l-0 first:pl-0 last:pr-0 medio:min-h-0 medio:border-l-0! medio:px-0! medio:pb-6">
            <header class="pt-3.5"><AnoTitulo ano={k + 1} rotuloClass="hidden" /></header>
            <div class="regua"></div>
            <div class="h-[84px] animate-respira rounded-md bg-tinta/10"></div>
            <div class="h-[84px] animate-respira rounded-md bg-tinta/10"></div>
          </section>
        {/each}
      {:else}
        {#each anos as ano (ano)}
          <Coluna
            {ano}
            lista={visiveis.filter((a) => Number(a.anoCurricular) === ano)}
            filtrado={filtroCurso !== ''}
            cursos={dados.cursos}
            {destacado}
            onmover={mover}
            onnovo={(a) => alunoDlg.abrir(null, a)}
            oneditar={(a) => alunoDlg.abrir(a)}
            onapagar={(a) => apagarDlg.abrir(a)}
          />
        {/each}
      {/if}
    </div>
  </main>
</div>

<AlunoDialog bind:this={alunoDlg} onguardado={(id) => (destacado = id)} />
<CursoDialog bind:this={cursoDlg} />
<ApagarDialog bind:this={apagarDlg} />
