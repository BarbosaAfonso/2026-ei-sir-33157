const API_URL = 'http://localhost:3000';
let cursosCache = [];

const tableBody = document.getElementById('alunosTableBody');
const totalBadge = document.getElementById('totalBadge');
const modal = document.getElementById('alunoModal');
const modalTitle = document.getElementById('modalTitle');
const form = document.getElementById('alunoForm');
const btnNovoAluno = document.getElementById('btnNovoAluno');
const btnFecharModal = document.getElementById('btnFecharModal');
const btnCancelar = document.getElementById('btnCancelar');

const inputId = document.getElementById('alunoId');
const inputNome = document.getElementById('nome');
const inputApelido = document.getElementById('apelido');
const selectCurso = document.getElementById('idCurso');
const selectAno = document.getElementById('anoCurricular');

document.addEventListener('DOMContentLoaded', async () => {
  await carregarCursos();
  await carregarAlunos();

  btnNovoAluno.addEventListener('click', () => abrirModal());
  btnFecharModal.addEventListener('click', fecharModal);
  btnCancelar.addEventListener('click', fecharModal);
  form.addEventListener('submit', guardarAluno);
});

// Carregar Lista de Cursos
async function carregarCursos() {
  try {
    const res = await fetch(`${API_URL}/cursos`);
    cursosCache = await res.json();
    selectCurso.innerHTML = '<option value="">Selecione um curso...</option>';
    cursosCache.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nomeDoCurso;
      selectCurso.appendChild(opt);
    });
  } catch (err) {
    console.error('Erro ao carregar cursos:', err);
  }
}

// 1. Listar Alunos (Read)
async function carregarAlunos() {
  try {
    const res = await fetch(`${API_URL}/alunos`);
    const alunos = await res.json();
    
    totalBadge.textContent = `${alunos.length} ${alunos.length === 1 ? 'aluno registado' : 'alunos registados'}`;

    if (alunos.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">
            <p>Nenhum aluno registado no sistema.</p>
          </td>
        </tr>`;
      return;
    }

    tableBody.innerHTML = alunos.map(aluno => {
      const curso = cursosCache.find(c => String(c.id) === String(aluno.idCurso));
      const nomeCurso = curso ? curso.nomeDoCurso : 'Não Definido';

      return `
        <tr>
          <td><span class="id-pill">#${aluno.id}</span></td>
          <td class="font-bold">${aluno.nome} ${aluno.apelido}</td>
          <td><span class="course-tag">${nomeCurso}</span></td>
          <td><span class="year-badge">${aluno.anoCurricular}º Ano</span></td>
          <td class="actions-cell">
            <button class="btn btn-sm btn-edit" onclick="editarAluno('${aluno.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              Editar
            </button>
            <button class="btn btn-sm btn-danger" onclick="apagarAluno('${aluno.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              Apagar
            </button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Erro ao ler alunos:', err);
    tableBody.innerHTML = '<tr><td colspan="5" class="empty-state text-error">Erro ao ligar ao servidor.</td></tr>';
  }
}

// 2. Adicionar ou Editar Aluno (Create / Update)
async function guardarAluno(e) {
  e.preventDefault();

  const id = inputId.value;
  const payload = {
    nome: inputNome.value.trim(),
    apelido: inputApelido.value.trim(),
    idCurso: selectCurso.value,
    anoCurricular: parseInt(selectAno.value, 10)
  };

  try {
    if (id) {
      // Atualizar existente (PUT)
      await fetch(`${API_URL}/alunos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, id: id })
      });
    } else {
      // NOVO ALUNO: Gerar ID numérico sequencial simples
      const res = await fetch(`${API_URL}/alunos`);
      const alunosExistentes = await res.json();
      
      const maiorId = alunosExistentes.reduce((max, item) => {
        const parsed = parseInt(item.id, 10);
        return !isNaN(parsed) && parsed > max ? parsed : max;
      }, 0);

      const novoId = String(maiorId + 1);

      await fetch(`${API_URL}/alunos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: novoId, ...payload })
      });
    }

    fecharModal();
    await carregarAlunos();
  } catch (err) {
    alert('Erro ao gravar os dados do aluno.');
    console.error(err);
  }
}

// 3. Preparar Edição (Read ID)
window.editarAluno = async function(id) {
  try {
    const res = await fetch(`${API_URL}/alunos/${id}`);
    const aluno = await res.json();

    inputId.value = aluno.id;
    inputNome.value = aluno.nome;
    inputApelido.value = aluno.apelido;
    selectCurso.value = aluno.idCurso;
    selectAno.value = aluno.anoCurricular;

    abrirModal(`Editar Aluno #${aluno.id}`);
  } catch (err) {
    alert('Erro ao carregar dados do aluno.');
  }
};

// 4. Apagar Aluno (Delete)
window.apagarAluno = async function(id) {
  if (confirm(`Tem a certeza que deseja eliminar o aluno #${id}?`)) {
    try {
      await fetch(`${API_URL}/alunos/${id}`, { method: 'DELETE' });
      await carregarAlunos();
    } catch (err) {
      alert('Erro ao eliminar aluno.');
    }
  }
};

function abrirModal(titulo = 'Novo Aluno') {
  modalTitle.textContent = titulo;
  if (!inputId.value) form.reset();
  modal.classList.remove('hidden');
}

function fecharModal() {
  modal.classList.add('hidden');
  form.reset();
  inputId.value = '';
}