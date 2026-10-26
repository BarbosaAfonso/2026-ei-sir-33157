const API_URL = 'https://two026-ei-sir-33157.onrender.com'; // URL da API (mock-server)
const NUM_CORES = 5; // número de cores de curso definidas no CSS (--curso-0 ... --curso-4)

let cursosCache = [];
let alunosCache = [];
let cursoAtivo = ''; // '' = todos os cursos

const grelha = document.getElementById('alunosGrid');
const resumo = document.getElementById('resumo');
const filtrosEl = document.getElementById('filtros');
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

  // Fechar o modal com Escape ou clicando fora dele
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) fecharModal();
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) fecharModal();
  });

  // Filtro por curso
  filtrosEl.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    cursoAtivo = chip.dataset.curso;
    renderFiltros();
    renderAlunos();
  });
});

// ---------- Utilitários ----------

function esc(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// Cada curso recebe uma cor pela ordem em que aparece na API
function corDoCurso(idCurso) {
  const i = cursosCache.findIndex(c => String(c.id) === String(idCurso));
  return i < 0 ? 'var(--curso-nd)' : `var(--curso-${i % NUM_CORES})`;
}

// ---------- Cursos ----------

async function carregarCursos() {
  try {
    const res = await fetch(`${API_URL}/cursos`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cursosCache = await res.json();

    selectCurso.innerHTML = '<option value="">Selecione um curso…</option>';
    cursosCache.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nomeDoCurso;
      selectCurso.appendChild(opt);
    });
    renderFiltros();
  } catch (err) {
    console.error('Erro ao carregar cursos:', err);
  }
}

function renderFiltros() {
  const chips = [
    { id: '', nome: 'Todos', cor: null },
    ...cursosCache.map(c => ({ id: String(c.id), nome: c.nomeDoCurso, cor: corDoCurso(c.id) }))
  ];

  filtrosEl.innerHTML = chips.map(ch => {
    const ativo = cursoAtivo === ch.id;
    return `
      <button type="button" class="chip${ativo ? ' ativo' : ''}" data-curso="${esc(ch.id)}"
              aria-pressed="${ativo}" ${ch.cor ? `style="--c:${ch.cor}"` : ''}>
        ${ch.cor ? '<span class="chip-ponto" aria-hidden="true"></span>' : ''}${esc(ch.nome)}
      </button>`;
  }).join('');
}

// ---------- 1. Listar alunos (Read) ----------

async function carregarAlunos() {
  try {
    const res = await fetch(`${API_URL}/alunos`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    alunosCache = await res.json();
    renderAlunos();
  } catch (err) {
    console.error('Erro ao ler alunos:', err);
    resumo.textContent = 'Sem ligação à API.';
    grelha.innerHTML = `
      <div class="estado">
        <h2>Não foi possível ligar à API</h2>
        <p>A página tentou ler os alunos em ${esc(API_URL)}. Abre um terminal na pasta <code>mock-server</code>, corre <code>npm start</code> e recarrega a página.</p>
      </div>`;
  }
}

function atualizarResumo(visiveis) {
  const total = alunosCache.length;
  if (cursoAtivo) {
    resumo.textContent = `A mostrar ${visiveis} de ${total} ${total === 1 ? 'aluno' : 'alunos'}.`;
  } else {
    const nc = cursosCache.length;
    resumo.textContent = `${total} ${total === 1 ? 'aluno registado' : 'alunos registados'} em ${nc} ${nc === 1 ? 'curso' : 'cursos'}.`;
  }
}

function renderAlunos() {
  const visiveis = cursoAtivo
    ? alunosCache.filter(a => String(a.idCurso) === cursoAtivo)
    : alunosCache;

  atualizarResumo(visiveis.length);

  if (alunosCache.length === 0) {
    grelha.innerHTML = `
      <div class="estado">
        <h2>Ainda não há alunos</h2>
        <p>Carrega em «Novo aluno» para registar o primeiro.</p>
      </div>`;
    return;
  }

  if (visiveis.length === 0) {
    grelha.innerHTML = `
      <div class="estado">
        <h2>Nenhum aluno neste curso</h2>
        <p>Escolhe outro curso nos filtros ou regista um novo aluno.</p>
      </div>`;
    return;
  }

  grelha.innerHTML = visiveis.map(aluno => {
    const curso = cursosCache.find(c => String(c.id) === String(aluno.idCurso));
    const nomeCurso = curso ? curso.nomeDoCurso : 'Curso não definido';
    const id = esc(aluno.id);

    return `
      <article class="cartao" style="--c:${corDoCurso(aluno.idCurso)}">
        <span class="cartao-id">#${id}</span>
        <h2 class="cartao-nome">${esc(aluno.nome)} ${esc(aluno.apelido)}</h2>
        <p class="cartao-curso">${esc(nomeCurso)}</p>
        <div class="cartao-rodape">
          <div class="ano" aria-label="${esc(aluno.anoCurricular)}.º ano">
            <span class="ano-n" aria-hidden="true">${esc(aluno.anoCurricular)}</span>
            <span class="ano-l" aria-hidden="true">º ano</span>
          </div>
          <div class="acoes">
            <button class="btn-mini" onclick="editarAluno('${id}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              Editar
            </button>
            <button class="btn-mini" onclick="apagarAluno('${id}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              Apagar
            </button>
          </div>
        </div>
      </article>`;
  }).join('');
}

// ---------- 2. Adicionar ou editar aluno (Create / Update) ----------

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
      // Novo aluno: gerar ID numérico sequencial simples
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
    alert('Não foi possível guardar o aluno. Confirma que a API está a correr.');
    console.error(err);
  }
}

// ---------- 3. Preparar edição (Read por ID) ----------

window.editarAluno = async function (id) {
  try {
    const res = await fetch(`${API_URL}/alunos/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const aluno = await res.json();

    inputId.value = aluno.id;
    inputNome.value = aluno.nome;
    inputApelido.value = aluno.apelido;
    selectCurso.value = aluno.idCurso;
    selectAno.value = aluno.anoCurricular;

    abrirModal(`Editar aluno #${aluno.id}`);
  } catch (err) {
    alert('Não foi possível carregar os dados do aluno.');
    console.error(err);
  }
};

// ---------- 4. Apagar aluno (Delete) ----------

window.apagarAluno = async function (id) {
  if (confirm(`Apagar o aluno #${id}? Esta ação não pode ser desfeita.`)) {
    try {
      await fetch(`${API_URL}/alunos/${id}`, { method: 'DELETE' });
      await carregarAlunos();
    } catch (err) {
      alert('Não foi possível apagar o aluno.');
      console.error(err);
    }
  }
};

// ---------- Modal ----------

function abrirModal(titulo = 'Novo aluno') {
  modalTitle.textContent = titulo;
  if (!inputId.value) form.reset();
  modal.classList.remove('hidden');
  inputNome.focus();
}

function fecharModal() {
  modal.classList.add('hidden');
  form.reset();
  inputId.value = '';
}

// ---------- Inclinação 3D da máquina (segue o rato) ----------

const maquina = document.getElementById('maquina');
const podeInclinar = window.matchMedia(
  '(min-width: 901px) and (hover: hover) and (prefers-reduced-motion: no-preference)'
);

document.addEventListener('mousemove', (e) => {
  if (!podeInclinar.matches) return;
  const x = e.clientX / window.innerWidth - 0.5;
  const y = e.clientY / window.innerHeight - 0.5;
  maquina.style.setProperty('--ry', `${-24 + x * 12}deg`);
  maquina.style.setProperty('--rx', `${y * -4}deg`);
});
