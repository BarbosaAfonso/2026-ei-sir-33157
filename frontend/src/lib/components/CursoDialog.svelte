<script>
  import Modal from './Modal.svelte';
  import Botao from './Botao.svelte';
  import { rotulo, entrada } from './campo.js';
  import { api } from '../api.js';
  import { dados, mostrarAviso } from '../dados.svelte.js';

  let modal;
  let nome = $state('');
  let aGuardar = $state(false);

  export function abrir() {
    nome = '';
    modal.abrir();
  }

  async function guardar(e) {
    e.preventDefault();
    const nomeDoCurso = nome.trim();
    if (!nomeDoCurso) return;
    aGuardar = true;
    try {
      const criado = await api('/cursos', { method: 'POST', body: { nomeDoCurso } });
      dados.cursos.push(criado);
      modal.fechar();
      mostrarAviso(`Curso "${criado.nomeDoCurso}" criado.`);
    } catch (err) {
      mostrarAviso(`Não foi possível criar o curso: ${err.message}`, true);
    } finally {
      aGuardar = false;
    }
  }
</script>

<Modal bind:this={modal} titulo="Novo curso">
  <form onsubmit={guardar}>
    <div class="mb-4">
      <label for="nomeDoCurso" class={rotulo}>Nome do curso</label>
      <input id="nomeDoCurso" class={entrada} type="text" required autocomplete="off" placeholder="Engenharia Informática" bind:value={nome}>
    </div>
    <div class="mt-6 flex justify-end gap-3">
      <Botao variante="secundario" onclick={() => modal.fechar()}>Cancelar</Botao>
      <Botao type="submit" disabled={aGuardar}>{aGuardar ? 'A criar…' : 'Criar curso'}</Botao>
    </div>
  </form>
</Modal>
