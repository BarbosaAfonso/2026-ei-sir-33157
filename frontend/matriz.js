const API_URL = 'https://two026-ei-sir-33157.onrender.com';
const ANOS_MINIMOS = 5;
const NUM_CORES = 5;

let cursos = [];
let alunos = [];
let linhas = [];        // cursos (e "Sem curso", se existir) com os alunos por ano
let anos = [];
let selecionada = null; // { linha, ano }

const $ = (id) => document.getElementById(id);
const matrizEl = $('matriz');
const detalheEl = $('detalhe');
const impressaoEl = $('impressao');
const resumo = $('resumo');

// ---------- Utilitários ----------

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

async function api(caminho) {
  let res;
  try {
    res = await fetch(API_URL + caminho);
  } catch {
    throw new Error('Sem ligação à API.');
  }
  if (!res.ok) throw new Error(`Erro ${res.status}.`);
  return res.json();
}

const porId = (a, b) => Number(a.id) - Number(b.id);

// ---------- Cálculo ----------

function calcular() {
  const maiorAno = Math.max(ANOS_MINIMOS, ...alunos.map((a) => Number(a.anoCurricular) || 0));
  anos = Array.from({ length: maiorAno }, (_, i) => i + 1);

  linhas = cursos.map((c, i) => ({
    id: String(c.id),
    nome: c.nomeDoCurso,
    i,
    alunos: alunos.filter((a) => indiceCurso(a.idCurso) === i).sort(porId)
  }));

  const semCurso = alunos.filter((a) => indiceCurso(a.idCurso) < 0).sort(porId);
  if (semCurso.length) linhas.push({ id: '', nome: 'Sem curso', i: -1, alunos: semCurso });
}

const alunosDaCelula = (linha, ano) => linha.alunos.filter((a) => Number(a.anoCurricular) === ano);

// ---------- Desenho ----------

function render() {
  calcular();
  resumo.textContent = `${plural(alunos.length, 'aluno', 'alunos')} em ${plural(cursos.length, 'curso', 'cursos')}`;
  renderMatriz();
  renderDetalhe();
  renderImpressao();
}

function renderMatriz() {
  matrizEl.setAttribute('aria-busy', 'false');
  const maximo = Math.max(1, ...linhas.flatMap((l) => anos.map((ano) => alunosDaCelula(l, ano).length)));

  const cabecalho = el('tr', {},
    el('th', { scope: 'col', class: 'canto' }, el('span', { class: 'so-leitor', text: 'Curso' })),
    ...anos.map((ano) =>
      el('th', { scope: 'col', 'aria-label': `${ano}º ano` },
        el('span', { class: 'ano', 'aria-hidden': 'true' },
          el('span', { class: 'num', text: String(ano) }),
          el('span', { class: 'ord', text: 'º' }),
          el('span', { class: 'rotulo', text: 'ano' })))),
    el('th', { scope: 'col', class: 'col-total' }, el('span', { class: 'rotulo-total', text: 'Total' })));

  const corpo = linhas.map((linha, idx) =>
    el('tr', {},
      el('th', { scope: 'row' },
        el('span', { class: 'curso-nome' }, forma(linha.i), linha.nome),
        el('span', { class: 'contagem-linha', text: plural(linha.alunos.length, 'aluno', 'alunos') })),
      ...anos.map((ano) => celulaEl(linha, idx, ano, maximo)),
      el('td', { class: 'total', text: String(linha.alunos.length) })));

  const rodape = el('tr', {},
    el('th', { scope: 'row', text: 'Total' }),
    ...anos.map((ano) => el('td', {
      class: 'total-ano',
      'data-ano': String(ano),
      text: String(alunos.filter((a) => Number(a.anoCurricular) === ano).length)
    })),
    el('td', { class: 'total', text: String(alunos.length) }));

  matrizEl.replaceChildren(el('table', { class: 'matriz' },
    el('caption', { class: 'so-leitor', text: 'Número de alunos por curso e ano curricular' }),
    el('thead', {}, cabecalho),
    el('tbody', {}, corpo),
    el('tfoot', {}, rodape)));
}

function celulaEl(linha, idx, ano, maximo) {
  const lista = alunosDaCelula(linha, ano);
  const n = lista.length;
  const botao = el('button', {
    type: 'button',
    class: 'celula-btn' + (n === 0 ? ' vazio' : ''),
    'data-linha': String(idx),
    'data-ano': String(ano),
    'aria-pressed': String(Boolean(selecionada && selecionada.linha === idx && selecionada.ano === ano)),
    'aria-label': `${linha.nome}, ${ano}º ano: ${plural(n, 'aluno', 'alunos')}`,
    onclick: () => selecionar(idx, ano)
  },
    el('span', { class: 'n', 'aria-hidden': 'true', text: String(n) }),
    el('span', { class: 'nomes', 'aria-hidden': 'true', text: n ? lista.map((a) => a.nome).join(', ') : 'Ninguém' }));
  botao.style.setProperty('--c', corCurso(linha.i));
  botao.style.setProperty('--i', String(n ? 0.35 + 0.65 * (n / maximo) : 0));
  return el('td', { 'data-ano': String(ano) }, botao);
}

function selecionar(idx, ano) {
  selecionada = { linha: idx, ano };
  matrizEl.querySelectorAll('.celula-btn').forEach((b) =>
    b.setAttribute('aria-pressed', String(Number(b.dataset.linha) === idx && Number(b.dataset.ano) === ano)));
  renderDetalhe();
  detalheEl.scrollIntoView({ block: 'nearest' });
}

function renderDetalhe() {
  if (!selecionada || !linhas[selecionada.linha]) {
    detalheEl.replaceChildren(el('p', { class: 'vazio-dica', text: 'Escolhe uma célula para ver os alunos.' }));
    return;
  }
  const linha = linhas[selecionada.linha];
  const ano = selecionada.ano;
  const lista = alunosDaCelula(linha, ano);

  const titulo = el('h2', {}, forma(linha.i), linha.nome,
    el('span', { class: 'sub', text: `${ano}º ano, ${plural(lista.length, 'aluno', 'alunos')}` }));

  const itens = lista.map((a) => {
    const li = el('li', {},
      el('p', { class: 'nome', text: `${a.nome} ${a.apelido}` }),
      el('p', { class: 'numero', text: `n.º ${a.id}` }));
    li.style.setProperty('--c', corCurso(linha.i));
    return li;
  });

  const adicionar = linha.id
    ? el('a', {
        class: 'btn btn-secundario',
        href: `index.html?novo=1&curso=${encodeURIComponent(linha.id)}&ano=${ano}`,
        text: 'Adicionar aluno'
      })
    : null;

  detalheEl.replaceChildren(
    titulo,
    lista.length
      ? el('ul', {}, itens)
      : el('p', { class: 'vazio-dica', text: `Ninguém em ${linha.nome} no ${ano}º ano.` }),
    adicionar);
}

// Lista completa, só visível ao imprimir
function renderImpressao() {
  const data = new Date().toLocaleDateString('pt-PT');
  const blocos = linhas.map((linha) =>
    el('div', {},
      el('h3', {}, forma(linha.i), `${linha.nome} (${plural(linha.alunos.length, 'aluno', 'alunos')})`),
      ...anos
        .map((ano) => ({ ano, lista: alunosDaCelula(linha, ano) }))
        .filter((x) => x.lista.length)
        .map((x) => el('p', {
          text: `${x.ano}º ano: ${x.lista.map((a) => `${a.nome} ${a.apelido} (n.º ${a.id})`).join(', ')}`
        }))));
  impressaoEl.replaceChildren(el('h2', { text: `Alunos por curso e ano, em ${data}` }), ...blocos);
}

// ---------- Carregar ----------

function renderEsqueleto() {
  matrizEl.setAttribute('aria-busy', 'true');
  detalheEl.replaceChildren();
  matrizEl.replaceChildren(...[1, 2, 3].map(() => el('div', { class: 'esqueleto', style: 'margin-top:12px;height:108px' })));
}

function renderErro(err) {
  matrizEl.setAttribute('aria-busy', 'false');
  resumo.textContent = 'Sem ligação à API.';
  matrizEl.replaceChildren(el('div', { class: 'erro' },
    el('h2', { text: 'Não foi possível ligar à API' }),
    el('p', { text: `O servidor em ${API_URL} não respondeu (${err.message}). Se estava parado, pode demorar até um minuto a acordar. Espera um pouco e tenta de novo.` }),
    el('button', { type: 'button', class: 'btn btn-primario', onclick: carregar, text: 'Tentar de novo' })));
}

async function carregar() {
  renderEsqueleto();
  resumo.textContent = 'A carregar…';
  const demora = setTimeout(() => {
    resumo.textContent = 'A ligar à API. O servidor pode demorar até um minuto a acordar.';
  }, 3000);
  try {
    [cursos, alunos] = await Promise.all([api('/cursos'), api('/alunos')]);
    clearTimeout(demora);
    render();
  } catch (err) {
    clearTimeout(demora);
    renderErro(err);
  }
}

$('btnImprimir').addEventListener('click', () => window.print());

carregar();
