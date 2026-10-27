const API_URL = 'https://two026-ei-sir-33157.onrender.com';
const ANOS_MINIMOS = 4;   // colunas 1º a 4º ano (cresce se existir um ano maior)
const NUM_CORES = 5;      // cores e formas distintas para os cursos

let cursos = [];
let alunos = [];
let filtroCurso = '';     // id do curso filtrado ('' = todos)
let arrastado = null;     // id do aluno que está a ser arrastado
let destacado = null;     // id do aluno que acabou de ser guardado ou movido
let alunoApagar = null;
let temporizadorAviso = null;

const $ = (id) => document.getElementById(id);
const quadro = $('quadro');
const filtrosEl = $('filtros');
const resumo = $('resumo');
const aviso = $('aviso');

const alunoDialog = $('alunoDialog');
const alunoForm = $('alunoForm');
const alunoTitulo = $('alunoTitulo');
const selectCurso = $('idCurso');
const btnGuardar = $('btnGuardar');
const apagarDialog = $('apagarDialog');
const apagarTexto = $('apagarTexto');
const btnApagarSim = $('btnApagarSim');

// ---------- Utilitários ----------

// Cria elementos sem innerHTML: os dados da API entram sempre como texto
function el(tag, props = {}, ...filhos) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const f of filhos.flat()) if (f != null) n.append(f);
  return n;
}

function plural(n, singular, pluralTxt) {
  return `${n} ${n === 1 ? singular : pluralTxt}`;
}

function indiceCurso(idCurso) {
  return cursos.findIndex((c) => String(c.id) === String(idCurso));
}

function corCurso(i) {
  return i < 0 ? 'var(--curso-nd)' : `var(--curso-${i % NUM_CORES})`;
}

function forma(i) {
  const classe = i < 0 ? 'forma-nd' : `forma-${i % NUM_CORES}`;
  const f = el('span', { class: `forma ${classe}`, 'aria-hidden': 'true' });
  f.style.setProperty('--c', corCurso(i));
  return f;
}

function iconeSvg(caminho) {
  const s = el('span', { 'aria-hidden': 'true' });
  s.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${caminho}</svg>`;
  return s;
}

const ICONE_EDITAR = '<path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>';
const ICONE_APAGAR = '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>';

async function api(caminho, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(API_URL + caminho, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error('Sem ligação à API.');
  }
  if (!res.ok) {
    let msg = `Erro ${res.status}.`;
    try { msg = (await res.json()).erro || msg; } catch { /* resposta sem JSON */ }
    throw new Error(msg);
  }
  return res.json();
}

function mostrarAviso(texto, erro = false) {
  clearTimeout(temporizadorAviso);
  aviso.textContent = texto;
  aviso.classList.toggle('erro-aviso', erro);
  aviso.classList.add('visivel');
  temporizadorAviso = setTimeout(() => aviso.classList.remove('visivel'), erro ? 6000 : 3500);
}

// ---------- Desenho ----------

function render() {
  renderResumo();
  renderFiltros();
  renderQuadro();
}

function alunosVisiveis() {
  return alunos
    .filter((a) => !filtroCurso || String(a.idCurso) === filtroCurso)
    .sort((a, b) => Number(a.id) - Number(b.id));
}

function renderResumo() {
  const visiveis = alunosVisiveis().length;
  if (filtroCurso) {
    const i = indiceCurso(filtroCurso);
    const nome = i < 0 ? 'este curso' : cursos[i].nomeDoCurso;
    resumo.textContent = `${plural(visiveis, 'aluno', 'alunos')} em ${nome}`;
  } else {
    resumo.textContent = `${plural(alunos.length, 'aluno', 'alunos')} em ${plural(cursos.length, 'curso', 'cursos')}`;
  }
}

function renderFiltros() {
  const chip = (id, nome, i, total) =>
    el('button', {
      type: 'button',
      class: 'chip',
      'aria-pressed': String(filtroCurso === id),
      onclick: () => { filtroCurso = id; render(); }
    }, i == null ? null : forma(i), nome, el('span', { class: 'n', text: String(total) }));

  filtrosEl.replaceChildren(
    chip('', 'Todos', null, alunos.length),
    ...cursos.map((c, i) =>
      chip(String(c.id), c.nomeDoCurso, i, alunos.filter((a) => String(a.idCurso) === String(c.id)).length))
  );
}

function renderQuadro() {
  quadro.setAttribute('aria-busy', 'false');
  const visiveis = alunosVisiveis();
  const maiorAno = Math.max(ANOS_MINIMOS, ...alunos.map((a) => Number(a.anoCurricular) || 0));
  const colunas = [];
  for (let ano = 1; ano <= maiorAno; ano++) {
    colunas.push(colunaEl(ano, visiveis.filter((a) => Number(a.anoCurricular) === ano)));
  }
  quadro.replaceChildren(...colunas);
  destacado = null;
}

function colunaEl(ano, lista) {
  const idTitulo = `ano-${ano}`;
  const col = el('section', { class: 'coluna', 'aria-labelledby': idTitulo },
    el('header', { class: 'coluna-topo' },
      el('h2', { class: 'ano', id: idTitulo, 'aria-label': `${ano}º ano` },
        el('span', { class: 'num', 'aria-hidden': 'true', text: String(ano) }),
        el('span', { class: 'ord', 'aria-hidden': 'true', text: 'º' }),
        el('span', { class: 'rotulo', 'aria-hidden': 'true', text: 'ano' })),
      el('p', { class: 'contagem', text: plural(lista.length, 'aluno', 'alunos') })),
    el('div', { class: 'regua', 'aria-hidden': 'true' }),
    lista.length
      ? el('ul', { class: 'lista' }, lista.map(cartaoEl))
      : [
          el('p', { class: 'vazio', text: filtroCurso ? `Nenhum aluno deste curso no ${ano}º ano.` : `Nenhum aluno no ${ano}º ano.` }),
          el('button', { type: 'button', class: 'btn-texto', onclick: () => abrirAluno(null, ano), text: 'Adicionar aluno' })
        ]);

  col.addEventListener('dragover', (e) => {
    if (arrastado == null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    col.classList.add('alvo');
  });
  col.addEventListener('dragleave', (e) => {
    if (!col.contains(e.relatedTarget)) col.classList.remove('alvo');
  });
  col.addEventListener('drop', (e) => {
    if (arrastado == null) return;
    e.preventDefault();
    const id = arrastado;
    arrastado = null;
    col.classList.remove('alvo');
    mover(id, ano);
  });
  return col;
}

function cartaoEl(a) {
  const i = indiceCurso(a.idCurso);
  const nomeCurso = i < 0 ? 'Sem curso' : cursos[i].nomeDoCurso;
  const nomeCompleto = `${a.nome} ${a.apelido}`;

  const li = el('li', {
    class: 'aluno' + (String(a.id) === String(destacado) ? ' novo' : ''),
    draggable: 'true'
  },
    el('p', { class: 'nome', text: nomeCompleto }),
    el('div', { class: 'acoes' },
      el('button', {
        type: 'button', class: 'icone', title: 'Editar', 'aria-label': `Editar ${nomeCompleto}`,
        onclick: () => abrirAluno(a)
      }, iconeSvg(ICONE_EDITAR)),
      el('button', {
        type: 'button', class: 'icone apagar', title: 'Apagar', 'aria-label': `Apagar ${nomeCompleto}`,
        onclick: () => pedirApagar(a)
      }, iconeSvg(ICONE_APAGAR))),
    el('p', { class: 'curso' }, forma(i), nomeCurso),
    el('p', { class: 'numero', text: `n.º ${a.id}` }));
  li.style.setProperty('--c', corCurso(i));

  li.addEventListener('dragstart', (e) => {
    arrastado = a.id;
    e.dataTransfer.setData('text/plain', String(a.id));
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => li.classList.add('a-arrastar'), 0);
  });
  li.addEventListener('dragend', () => {
    arrastado = null;
    li.classList.remove('a-arrastar');
    document.querySelectorAll('.coluna.alvo').forEach((c) => c.classList.remove('alvo'));
  });
  return li;
}

function renderEsqueleto() {
  quadro.setAttribute('aria-busy', 'true');
  filtrosEl.replaceChildren();
  const colunas = [];
  for (let ano = 1; ano <= ANOS_MINIMOS; ano++) {
    colunas.push(el('section', { class: 'coluna', 'aria-hidden': 'true' },
      el('header', { class: 'coluna-topo' },
        el('p', { class: 'ano' },
          el('span', { class: 'num', text: String(ano) }),
          el('span', { class: 'ord', text: 'º' }))),
      el('div', { class: 'regua' }),
      el('div', { class: 'esqueleto' }),
      el('div', { class: 'esqueleto' })));
  }
  quadro.replaceChildren(...colunas);
}

function renderErro(err) {
  quadro.setAttribute('aria-busy', 'false');
  resumo.textContent = 'Sem ligação à API.';
  filtrosEl.replaceChildren();
  quadro.replaceChildren(el('div', { class: 'erro' },
    el('h2', { text: 'Não foi possível ligar à API' }),
    el('p', { text: `O servidor em ${API_URL} não respondeu (${err.message}). Se estava parado, pode demorar até um minuto a acordar. Espera um pouco e tenta de novo.` }),
    el('button', { type: 'button', class: 'btn btn-primario', onclick: carregar, text: 'Tentar de novo' })));
}

// ---------- Carregar dados ----------

async function carregar() {
  renderEsqueleto();
  resumo.textContent = 'A carregar…';
  // O plano gratuito do Render adormece: avisa quando demora mais do que o normal
  const demora = setTimeout(() => {
    resumo.textContent = 'A ligar à API. O servidor pode demorar até um minuto a acordar.';
  }, 3000);

  try {
    [cursos, alunos] = await Promise.all([api('/cursos'), api('/alunos')]);
    clearTimeout(demora);
    preencherSelectCursos();
    render();
    abrirNovoPeloEndereco();
  } catch (err) {
    clearTimeout(demora);
    renderErro(err);
  }
}

// A matriz envia para aqui com ?novo=1&curso=..&ano=.. para adicionar já com os campos preenchidos
function abrirNovoPeloEndereco() {
  const params = new URLSearchParams(location.search);
  if (params.get('novo') !== '1') return;
  abrirAluno(null, Number(params.get('ano')) || null, params.get('curso'));
  history.replaceState(null, '', location.pathname);
}

// ---------- Mudar de ano (arrastar) ----------

async function mover(id, ano) {
  const aluno = alunos.find((a) => String(a.id) === String(id));
  if (!aluno || Number(aluno.anoCurricular) === ano) return;

  const anterior = aluno.anoCurricular;
  aluno.anoCurricular = ano;
  destacado = aluno.id;
  render();

  try {
    await api(`/alunos/${aluno.id}`, {
      method: 'PUT',
      body: { nome: aluno.nome, apelido: aluno.apelido, idCurso: aluno.idCurso, anoCurricular: ano }
    });
    mostrarAviso(`${aluno.nome} ${aluno.apelido} passou para o ${ano}º ano.`);
  } catch (err) {
    aluno.anoCurricular = anterior;
    render();
    mostrarAviso(`Não foi possível mudar o ano: ${err.message}`, true);
  }
}

// ---------- Criar e editar ----------

function abrirAluno(aluno, anoPreDefinido, cursoPreDefinido) {
  alunoForm.reset();
  alunoForm.dataset.id = aluno ? aluno.id : '';
  alunoTitulo.textContent = aluno ? `Editar aluno n.º ${aluno.id}` : 'Novo aluno';
  if (aluno) {
    alunoForm.elements.nome.value = aluno.nome;
    alunoForm.elements.apelido.value = aluno.apelido;
    selectCurso.value = String(aluno.idCurso);
    alunoForm.elements.ano.value = String(aluno.anoCurricular);
  } else {
    if (anoPreDefinido) alunoForm.elements.ano.value = String(anoPreDefinido);
    if (cursoPreDefinido) selectCurso.value = String(cursoPreDefinido);
  }
  alunoDialog.showModal();
}

alunoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = alunoForm.dataset.id;
  const dados = {
    nome: alunoForm.elements.nome.value.trim(),
    apelido: alunoForm.elements.apelido.value.trim(),
    idCurso: selectCurso.value,
    anoCurricular: Number(alunoForm.elements.ano.value)
  };

  btnGuardar.disabled = true;
  btnGuardar.textContent = 'A guardar…';
  try {
    if (id) {
      const guardado = await api(`/alunos/${id}`, { method: 'PUT', body: dados });
      alunos = alunos.map((a) => (String(a.id) === String(id) ? guardado : a));
      destacado = guardado.id;
    } else {
      const criado = await api('/alunos', { method: 'POST', body: dados });
      alunos.push(criado);
      destacado = criado.id;
    }
    alunoDialog.close();
    render();
    mostrarAviso('Aluno guardado.');
  } catch (err) {
    mostrarAviso(`Não foi possível guardar o aluno: ${err.message}`, true);
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar';
  }
});

// ---------- Criar curso ----------

const cursoDialog = $('cursoDialog');
const cursoForm = $('cursoForm');
const btnGuardarCurso = $('btnGuardarCurso');

function preencherSelectCursos() {
  selectCurso.replaceChildren(
    el('option', { value: '', text: 'Escolhe um curso' }),
    ...cursos.map((c) => el('option', { value: c.id, text: c.nomeDoCurso })));
}

cursoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = cursoForm.elements.nomeDoCurso.value.trim();
  if (!nome) return;
  btnGuardarCurso.disabled = true;
  btnGuardarCurso.textContent = 'A criar…';
  try {
    const criado = await api('/cursos', { method: 'POST', body: { nomeDoCurso: nome } });
    cursos.push(criado);
    preencherSelectCursos();
    cursoDialog.close();
    render();
    mostrarAviso(`Curso "${criado.nomeDoCurso}" criado.`);
  } catch (err) {
    mostrarAviso(`Não foi possível criar o curso: ${err.message}`, true);
  } finally {
    btnGuardarCurso.disabled = false;
    btnGuardarCurso.textContent = 'Criar curso';
  }
});

// ---------- Apagar ----------

function pedirApagar(aluno) {
  alunoApagar = aluno;
  apagarTexto.textContent = `${aluno.nome} ${aluno.apelido} (n.º ${aluno.id}) deixa de constar da lista. Não é possível desfazer.`;
  apagarDialog.showModal();
}

btnApagarSim.addEventListener('click', async () => {
  const aluno = alunoApagar;
  if (!aluno) return;
  btnApagarSim.disabled = true;
  try {
    await api(`/alunos/${aluno.id}`, { method: 'DELETE' });
    alunos = alunos.filter((a) => String(a.id) !== String(aluno.id));
    apagarDialog.close();
    render();
    mostrarAviso('Aluno apagado.');
  } catch (err) {
    mostrarAviso(`Não foi possível apagar o aluno: ${err.message}`, true);
  } finally {
    btnApagarSim.disabled = false;
  }
});

// ---------- Eventos gerais ----------

$('btnNovoAluno').addEventListener('click', () => abrirAluno(null));
$('btnNovoCurso').addEventListener('click', () => { cursoForm.reset(); cursoDialog.showModal(); });
$('btnCancelarCurso').addEventListener('click', () => cursoDialog.close());
$('btnCancelar').addEventListener('click', () => alunoDialog.close());
$('btnApagarNao').addEventListener('click', () => apagarDialog.close());

// Clicar fora da caixa (no fundo escurecido) fecha o diálogo
[alunoDialog, cursoDialog, apagarDialog].forEach((d) =>
  d.addEventListener('click', (e) => { if (e.target === d) d.close(); }));

carregar();