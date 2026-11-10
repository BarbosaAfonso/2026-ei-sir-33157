export const API_URL = import.meta.env.VITE_API_URL || 'https://two026-ei-sir-33157.onrender.com';
export const ANOS_MINIMOS = 4; // colunas 1º a 4º ano (cresce se existir um ano maior)
export const NUM_CORES = 5;    // cores e formas distintas para os cursos

// Uma forma por curso (a cor nunca vai sozinha). Classes completas, para o Tailwind as encontrar.
export const FORMAS = [
  'rounded-full',
  'rounded-[2px]',
  '[clip-path:polygon(50%_0,100%_100%,0_100%)]',
  '[clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)]',
  '[clip-path:polygon(25%_5%,75%_5%,100%_50%,75%_95%,25%_95%,0_50%)]'
];

export const plural = (n, singular, pluralTxt) => `${n} ${n === 1 ? singular : pluralTxt}`;

export const indiceCurso = (cursos, idCurso) =>
  cursos.findIndex((c) => String(c.id) === String(idCurso));

export const corCurso = (i) => (i < 0 ? 'var(--color-curso-nd)' : `var(--color-curso-${i % NUM_CORES})`);

export const porId = (a, b) => Number(a.id) - Number(b.id);

export function anosDaTabela(alunos) {
  const maior = Math.max(ANOS_MINIMOS, ...alunos.map((a) => Number(a.anoCurricular) || 0));
  return Array.from({ length: maior }, (_, i) => i + 1);
}
