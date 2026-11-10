<script>
  import Botao from '../lib/components/Botao.svelte';
  import Forma from '../lib/components/Forma.svelte';
  import AnoTitulo from '../lib/components/AnoTitulo.svelte';
  import Erro from '../lib/components/Erro.svelte';
  import { dados, resumoDeCarga } from '../lib/dados.svelte.js';
  import { anosDaTabela, corCurso, indiceCurso, plural, porId } from '../lib/util.js';

  let selecionada = $state(null); // { linha, ano }

  const anos = $derived(anosDaTabela(dados.alunos));

  // Uma linha por curso (e "Sem curso", se existir) com os seus alunos
  const linhas = $derived.by(() => {
    const l = dados.cursos.map((c, i) => ({
      id: String(c.id),
      nome: c.nomeDoCurso,
      i,
      alunos: dados.alunos.filter((a) => indiceCurso(dados.cursos, a.idCurso) === i).toSorted(porId)
    }));
    const semCurso = dados.alunos.filter((a) => indiceCurso(dados.cursos, a.idCurso) < 0).toSorted(porId);
    if (semCurso.length) l.push({ id: '', nome: 'Sem curso', i: -1, alunos: semCurso });
    return l;
  });

  const daCelula = (linha, ano) => linha.alunos.filter((a) => Number(a.anoCurricular) === ano);
  const totalAno = (ano) => dados.alunos.filter((a) => Number(a.anoCurricular) === ano).length;

  const maximo = $derived(Math.max(1, ...linhas.flatMap((l) => anos.map((ano) => daCelula(l, ano).length))));

  const resumo = $derived(
    resumoDeCarga() ??
      `${plural(dados.alunos.length, 'aluno', 'alunos')} em ${plural(dados.cursos.length, 'curso', 'cursos')}`
  );

  const linhaEscolhida = $derived(selecionada ? linhas[selecionada.linha] : null);
  const listaEscolhida = $derived(linhaEscolhida ? daCelula(linhaEscolhida, selecionada.ano) : []);

  let detalhe;
  function escolher(linha, ano) {
    selecionada = { linha, ano };
    detalhe?.scrollIntoView({ block: 'nearest' });
  }

  function adicionar() {
    dados.pedidoNovo = { curso: linhaEscolhida.id, ano: selecionada.ano };
    location.hash = '#/';
  }

  // Intensidade da cor da célula: mais alunos, mais cor
  const intensidade = (n) => (n ? 0.35 + 0.65 * (n / maximo) : 0);

  const th = 'border-t border-linha py-3.5 pr-4 text-left align-top font-bold pequeno:col-span-full pequeno:border-0 pequeno:p-0';
  const celula = 'border-t border-l border-linha p-1.5 align-top pequeno:border-0 pequeno:p-0';
  const total = 'px-3 py-3.5 font-display text-[34px] leading-none font-extrabold tabular-nums';
</script>

<div class="mx-auto max-w-[1440px] px-8 pt-8 pb-14 pequeno:px-4 pequeno:pt-6 print:max-w-none print:p-0">
  <header class="flex flex-wrap items-end justify-between gap-6">
    <div>
      <h1 class="font-display text-[clamp(64px,9vw,112px)] leading-[0.82] font-extrabold tracking-[-0.01em] print:text-[48px]">Matriz</h1>
      <p class="mt-3.5 text-lg font-semibold print:mt-1.5" aria-live="polite">{resumo}</p>
      <p class="mt-0.5 text-[15px] text-tinta-2 print:hidden">Cada célula conta os alunos de um curso num ano. Clica numa célula para ver quem são.</p>
    </div>
    <div class="flex items-center gap-3 print:hidden">
      <Botao variante="secundario" href="#/">Ver alunos</Botao>
      <Botao onclick={() => window.print()}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2"/><rect x="6" y="14" width="12" height="7"/></svg>
        Imprimir
      </Botao>
    </div>
  </header>

  <main>
    <div class="mt-8 border-t-2 border-tinta print:break-inside-avoid" aria-busy={dados.estado === 'a-carregar'}>
      {#if dados.estado === 'erro'}
        <Erro />
      {:else if dados.estado === 'a-carregar'}
        {#each [1, 2, 3] as k (k)}
          <div class="mt-3 h-[108px] animate-respira rounded-md bg-tinta/10"></div>
        {/each}
      {:else}
        <table class="w-full table-fixed border-collapse pequeno:block">
          <caption class="sr-only">Número de alunos por curso e ano curricular</caption>

          <thead class="pequeno:sr-only">
            <tr>
              <th scope="col" class="w-[22%] pt-3.5 pr-3 pl-0 text-left align-bottom font-normal">
                <span class="sr-only">Curso</span>
                <div class="regua mt-2.5"></div>
              </th>
              {#each anos as ano (ano)}
                <th scope="col" aria-label="{ano}º ano" class="border-l border-linha px-3 pt-3.5 text-left align-bottom font-normal">
                  <AnoTitulo {ano} numClass="text-[58px]" ordClass="text-lg" rotuloClass="text-sm" />
                  <div class="regua -mx-3 mt-2.5"></div>
                </th>
              {/each}
              <th scope="col" class="w-[9%] border-l border-linha px-3 pt-3.5 text-left align-bottom font-normal">
                <span class="font-texto text-sm leading-none font-semibold text-tinta-2">Total</span>
                <div class="regua -mx-3 mt-2.5"></div>
              </th>
            </tr>
          </thead>

          <tbody class="pequeno:block">
            {#each linhas as linha, idx (linha.id || 'sem-curso')}
              <tr class="pequeno:grid pequeno:gap-1.5 pequeno:border-t pequeno:border-linha pequeno:py-4 pequeno:first:border-t-0" style="grid-template-columns: repeat({anos.length}, minmax(0, 1fr))">
                <th scope="row" class={th}>
                  <span class="flex items-start gap-2.5 text-[17px] leading-tight"><Forma i={linha.i} class="mt-[5px]" />{linha.nome}</span>
                  <span class="mt-1 ml-[21px] block text-sm font-normal text-tinta-2">{plural(linha.alunos.length, 'aluno', 'alunos')}</span>
                </th>
                {#each anos as ano (ano)}
                  {@const lista = daCelula(linha, ano)}
                  {@const n = lista.length}
                  <td class={celula}>
                    <span class="mb-0.5 hidden text-xs leading-tight font-semibold text-tinta-2 pequeno:block">{ano}º</span>
                    <button
                      type="button"
                      aria-pressed={selecionada?.linha === idx && selecionada?.ano === ano}
                      aria-label="{linha.nome}, {ano}º ano: {plural(n, 'aluno', 'alunos')}"
                      onclick={() => escolher(idx, ano)}
                      style="--c: {corCurso(linha.i)}; --i: {intensidade(n)}; {n ? '' : 'background: repeating-linear-gradient(135deg, transparent 0 7px, rgb(23 58 49 / 0.13) 7px 8px)'}"
                      class="flex min-h-[108px] w-full flex-col justify-between gap-2 rounded-md border-[1.5px] border-transparent px-3 py-2.5 text-left text-tinta hover:border-tinta aria-pressed:border-tinta aria-pressed:shadow-[inset_0_0_0_1.5px_var(--color-tinta)]
                        pequeno:min-h-[68px] pequeno:p-2 print:min-h-0 print:border-linha
                        {n ? 'bg-[color-mix(in_srgb,var(--c)_calc(var(--i)*38%),var(--color-folha))]' : 'text-tinta-2'}"
                    >
                      <span aria-hidden="true" class="font-display text-[52px] leading-[0.85] font-extrabold tabular-nums pequeno:text-4xl {n ? '' : 'opacity-55'}">{n}</span>
                      <span aria-hidden="true" class="line-clamp-2 text-[13.5px] leading-snug font-normal pequeno:hidden print:hidden">{n ? lista.map((a) => a.nome).join(', ') : 'Ninguém'}</span>
                    </button>
                  </td>
                {/each}
                <td class="{celula} {total} pequeno:hidden">{linha.alunos.length}</td>
              </tr>
            {/each}
          </tbody>

          <tfoot class="pequeno:block">
            <tr class="pequeno:grid pequeno:gap-1.5 pequeno:border-t-2 pequeno:border-tinta pequeno:py-4" style="grid-template-columns: repeat({anos.length}, minmax(0, 1fr))">
              <th scope="row" class="border-t-2 border-tinta py-3.5 pr-4 text-left align-top text-[17px] font-bold pequeno:col-span-full pequeno:border-0 pequeno:p-0">Total</th>
              {#each anos as ano (ano)}
                <td class="border-t-2 border-l border-tinta border-l-linha {total} pequeno:border-0 pequeno:p-0 pequeno:text-[26px]">
                  <span class="mb-0.5 hidden font-texto text-xs leading-tight font-semibold text-tinta-2 pequeno:block">{ano}º</span>
                  {totalAno(ano)}
                </td>
              {/each}
              <td class="border-t-2 border-l border-tinta border-l-linha {total} pequeno:hidden">{dados.alunos.length}</td>
            </tr>
          </tfoot>
        </table>
      {/if}
    </div>

    <!-- Detalhe da célula escolhida -->
    <section bind:this={detalhe} aria-live="polite" aria-label="Alunos da célula escolhida" class="mt-7 min-h-[150px] border-t-2 border-tinta pt-5 print:hidden">
      {#if dados.estado === 'ok'}
        {#if !linhaEscolhida}
          <p class="text-tinta-2">Escolhe uma célula para ver os alunos.</p>
        {:else}
          <h2 class="flex flex-wrap items-center gap-x-3.5 gap-y-1 font-display text-[44px] leading-none font-extrabold pequeno:text-4xl">
            <Forma i={linhaEscolhida.i} class="size-[14px]" />{linhaEscolhida.nome}
            <span class="font-texto text-[19px] leading-tight font-medium text-tinta-2">{selecionada.ano}º ano, {plural(listaEscolhida.length, 'aluno', 'alunos')}</span>
          </h2>
          {#if listaEscolhida.length}
            <ul class="my-[18px] grid list-none grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-2.5">
              {#each listaEscolhida as a (a.id)}
                <li style="--c: {corCurso(linhaEscolhida.i)}" class="rounded-md border border-l-[5px] border-linha border-l-(color:--c) bg-folha px-3.5 py-2.5">
                  <p class="text-[17px] leading-tight font-bold">{a.nome} {a.apelido}</p>
                  <p class="mt-0.5 text-[13px] text-tinta-2 tabular-nums">n.º {a.id}</p>
                </li>
              {/each}
            </ul>
          {:else}
            <p class="my-[18px] text-tinta-2">Ninguém em {linhaEscolhida.nome} no {selecionada.ano}º ano.</p>
          {/if}
          {#if linhaEscolhida.id}
            <Botao variante="secundario" onclick={adicionar}>Adicionar aluno</Botao>
          {/if}
        {/if}
      {/if}
    </section>

    <!-- Lista completa, só visível ao imprimir -->
    <section aria-hidden="true" class="mt-7 hidden border-t-2 border-tinta pt-3.5 print:block print:break-inside-avoid">
      <h2 class="mb-2.5 font-display text-[28px] leading-none font-extrabold">Alunos por curso e ano, em {new Date().toLocaleDateString('pt-PT')}</h2>
      {#each linhas as linha (linha.id || 'sem-curso')}
        <div>
          <h3 class="mt-3.5 mb-1 flex items-center gap-2 text-[15px] font-bold"><Forma i={linha.i} />{linha.nome} ({plural(linha.alunos.length, 'aluno', 'alunos')})</h3>
          {#each anos as ano (ano)}
            {@const lista = daCelula(linha, ano)}
            {#if lista.length}
              <p class="my-0.5 ml-[19px] text-[13px] leading-snug">{ano}º ano: {lista.map((a) => `${a.nome} ${a.apelido} (n.º ${a.id})`).join(', ')}</p>
            {/if}
          {/each}
        </div>
      {/each}
    </section>
  </main>
</div>
