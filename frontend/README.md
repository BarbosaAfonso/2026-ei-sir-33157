# Front-end (Svelte + Tailwind)

Svelte 5 com Tailwind CSS 4, compilado com Vite.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # gera a pasta dist/
npm run preview   # serve a pasta dist/
```

Por omissão fala com a API no Render. Para usar uma API local, criar `.env.local` com `VITE_API_URL=http://localhost:3000` (ver `.env.example`).

## Estrutura

```text
src/
  main.js                      arranque
  App.svelte                   escolhe a página pelo endereço (#/ alunos, #/matriz)
  app.css                      Tailwind, cores, tipos de letra e animações
  pages/Alunos.svelte          quadro por ano, filtros, arrastar para mudar de ano
  pages/Matriz.svelte          matriz curso × ano, detalhe e impressão
  lib/dados.svelte.js          estado partilhado (cursos, alunos, avisos)
  lib/api.js, lib/util.js      pedidos à API e funções auxiliares
  lib/components/              Botao, Modal, CartaoAluno, Coluna, diálogos, ...
```

## Deploy na Vercel

Root Directory `frontend`; a Vercel reconhece o Vite sozinha (Build `npm run build`, Output `dist`).
