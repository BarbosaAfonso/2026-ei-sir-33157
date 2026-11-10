// Estado partilhado pelas duas páginas: os dados são carregados uma vez
import { api } from './api.js';

export const dados = $state({
  cursos: [],
  alunos: [],
  estado: 'a-carregar', // 'a-carregar' | 'ok' | 'erro'
  erro: '',
  demora: false,
  pedidoNovo: null      // { curso, ano }: a matriz pede ao quadro para abrir "Novo aluno" já preenchido
});

export const aviso = $state({ texto: '', erro: false, visivel: false });
export const arrasto = $state({ id: null }); // aluno que está a ser arrastado

let temporizadorAviso;

export function mostrarAviso(texto, erro = false) {
  clearTimeout(temporizadorAviso);
  aviso.texto = texto;
  aviso.erro = erro;
  aviso.visivel = true;
  temporizadorAviso = setTimeout(() => (aviso.visivel = false), erro ? 6000 : 3500);
}

export async function carregar() {
  dados.estado = 'a-carregar';
  dados.demora = false;
  // O plano gratuito do Render adormece: avisa quando demora mais do que o normal
  const demora = setTimeout(() => (dados.demora = true), 3000);
  try {
    const [cursos, alunos] = await Promise.all([api('/cursos'), api('/alunos')]);
    dados.cursos = cursos;
    dados.alunos = alunos;
    dados.estado = 'ok';
  } catch (err) {
    dados.erro = err.message;
    dados.estado = 'erro';
  } finally {
    clearTimeout(demora);
  }
}

// Texto do resumo enquanto os dados não estão prontos (null quando estão)
export function resumoDeCarga() {
  if (dados.estado === 'a-carregar') {
    return dados.demora
      ? 'A ligar à API. O servidor pode demorar até um minuto a acordar.'
      : 'A carregar…';
  }
  return dados.estado === 'erro' ? 'Sem ligação à API.' : null;
}
