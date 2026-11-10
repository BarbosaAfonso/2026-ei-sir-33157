<script>
  import Modal from './Modal.svelte';
  import Botao from './Botao.svelte';
  import { api } from '../api.js';
  import { dados, mostrarAviso } from '../dados.svelte.js';

  let modal;
  let aluno = $state(null);
  let aApagar = $state(false);

  export function abrir(a) {
    aluno = a;
    modal.abrir();
  }

  async function apagar() {
    aApagar = true;
    try {
      await api(`/alunos/${aluno.id}`, { method: 'DELETE' });
      dados.alunos = dados.alunos.filter((a) => String(a.id) !== String(aluno.id));
      modal.fechar();
      mostrarAviso('Aluno apagado.');
    } catch (err) {
      mostrarAviso(`Não foi possível apagar o aluno: ${err.message}`, true);
    } finally {
      aApagar = false;
    }
  }
</script>

<Modal bind:this={modal} titulo="Apagar aluno?">
  <p class="mb-2 text-tinta-2">
    {aluno ? `${aluno.nome} ${aluno.apelido} (n.º ${aluno.id}) deixa de constar da lista. Não é possível desfazer.` : ''}
  </p>
  <div class="mt-6 flex justify-end gap-3">
    <Botao variante="secundario" onclick={() => modal.fechar()}>Cancelar</Botao>
    <Botao variante="perigo" disabled={aApagar} onclick={apagar}>Apagar aluno</Botao>
  </div>
</Modal>
