# API Escola (Express + MongoDB Atlas, MVC)

## Estrutura

```
server.js                 arranque (liga à BD e inicia o servidor)
src/app.js                configuração do Express
src/config/db.js          ligação ao Atlas
src/models/               Curso, Aluno (Mongoose)
src/controllers/          lógica dos endpoints
src/routes/               definição das rotas
src/seed/                 importação do bd.json
```

## Como usar

1. `npm install`
2. Copiar `.env.example` para `.env` e preencher `MONGODB_URI` com a connection string do Atlas
   (no Atlas: Database > Connect > Drivers; em Network Access permitir o teu IP).
3. `npm run seed` para importar os dados do `bd.json`
4. `npm run dev` (ou `npm start`)

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | /cursos | Lista cursos |
| GET | /cursos/:id | Obtém um curso |
| GET | /cursos/:id/alunos | Alunos de um curso |
| POST | /cursos | Cria curso `{ "nomeDoCurso": "..." }` |
| PUT | /cursos/:id | Atualiza curso |
| DELETE | /cursos/:id | Apaga curso (409 se tiver alunos) |
| GET | /alunos | Lista alunos (filtros `?idCurso=` e `?anoCurricular=`) |
| GET | /alunos/:id | Obtém um aluno (com o curso) |
| POST | /alunos | Cria aluno `{ "nome", "apelido", "idCurso", "anoCurricular" }` |
| PUT | /alunos/:id | Atualiza aluno |
| DELETE | /alunos/:id | Apaga aluno |

Nota: os ids `"1"`, `"2"`... do `bd.json` são convertidos em `_id` (ObjectId) do MongoDB no seed;
`idCurso` passa a referenciar o `_id` do curso.
