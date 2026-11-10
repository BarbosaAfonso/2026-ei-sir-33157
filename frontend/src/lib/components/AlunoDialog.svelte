<script>
  import Modal from './Modal.svelte';
  import Botao from './Botao.svelte';
  import { rotulo, entrada } from './campo.js';
  import { api } from '../api.js';
  import { dados, mostrarAviso } from '../dados.svelte.js';
  import { anosDaTabela } from '../util.js';

  // onguardado(id): a página destaca o cartão que acabou de ser guardado
  let { onguardado } = $props();

  let modal;
  let id = $state('');
  let nome = $state('');
  let apelido = $state('');
  let idCurso = $state('');
  let ano = $state('');
  let aGuardar = $state(false);

  // 1º a 4º ano, mais um ano maior se já existir algum aluno nele
  const anos = $derived(anosDaTabela(dados.alunos));

  export function abrir(aluno, anoPreDefinido, cursoPreDefinido) {
    id = aluno ? String(aluno.id) : '';
    nome = aluno?.nome ?? '';
    apelido = aluno?.apelido ?? '';
    idCurso = aluno ? String(aluno.idCurso) : cursoPreDefinido ? String(cursoPreDefinido) : '';
    ano = aluno ? String(aluno.anoCurricular) : anoPreDefinido ? String(anoPreDefinido) : '';
    modal.abrir();
  }

  async function guardar(e) {
    e.preventDefault();
    const corpo = {
      nome: nome.trim(),
      apelido: apelido.trim(),
      idCurso,
      anoCurricular: Number(ano)
    };
    aGuardar = true;
    try {
      let guardado;
      if (id) {
        guardado = await api(`/alunos/${id}`, { method: 'PUT', body: corpo });
        const i = dados.alunos.findIndex((a) => String(a.id) === id);
        if (i >= 0) dados.alunos[i] = guardado;
      } else {
        guardado = await api('/alunos', { method: 'POST', body: corpo });
        dados.alunos.push(guardado);
      }
      onguardado?.(guardado.id);
      modal.fechar();
      mostrarAviso('Aluno guardado.');
    } catch (err) {
      mostrarAviso(`Não foi possível guardar o aluno: ${err.message}`, true);
    } finally {
      aGuardar = false;
    }
  }
</script>

<Modal bind:this={modal} titulo={id ? `Editar aluno n.º ${id}` : 'Novo aluno'}>
  <form onsubmit={guardar}>
    <div class="grid grid-cols-2 gap-4 pequeno:grid-cols-1 pequeno:gap-0">
      <div class="mb-4">
        <label for="nome" class={rotulo}>Nome</label>
        <input id="nome" class={entrada} type="text" required autocomplete="off" placeholder="Afonso" bind:value={nome}>
      </div>
      <div class="mb-4">
        <label for="apelido" class={rotulo}>Apelido</label>
        <input id="apelido" class={entrada} type="text" required autocomplete="off" placeholder="Barbosa" bind:value={apelido}>
      </div>
    </div>

    <div class="mb-4">
      <label for="idCurso" class={rotulo}>Curso</label>
      <select id="idCurso" class={entrada} required bind:value={idCurso}>
        <option value="">Escolhe um curso</option>
        {#each dados.cursos as c (c.id)}
          <option value={String(c.id)}>{c.nomeDoCurso}</option>
        {/each}
      </select>
    </div>

    <fieldset class="flex flex-wrap gap-2 border-0">
      <legend class="{rotulo} w-full">Ano curricular</legend>
      {#each anos as a (a)}
        <label class="relative">
          <input class="peer absolute inset-0 cursor-pointer opacity-0" type="radio" name="ano" value={String(a)} required bind:group={ano}>
          <span class="inline-flex h-11 min-w-[52px] items-center justify-center rounded-md border-[1.5px] border-tinta bg-white font-texto text-[17px] leading-none font-bold peer-checked:bg-tinta peer-checked:text-papel peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foco">{a}º</span>
        </label>
      {/each}
    </fieldset>

    <div class="mt-6 flex justify-end gap-3">
      <Botao variante="secundario" onclick={() => modal.fechar()}>Cancelar</Botao>
      <Botao type="submit" disabled={aGuardar}>{aGuardar ? 'A guardar…' : 'Guardar'}</Botao>
    </div>
  </form>
</Modal>
