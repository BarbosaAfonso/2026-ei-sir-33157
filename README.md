# Gestão de Alunos

Atividade Prática #1: consumo e implementação de APIs RESTful. Aplicação com front-end e back-end separados, para gerir alunos e cursos.

## Links

| | URL |
|---|---|
| Front-end (Vercel) | https://2026-ei-sir-33157-frontend.vercel.app |
| API real (Render) | https://two026-ei-sir-33157.onrender.com |
| Documentação Swagger | https://two026-ei-sir-33157.onrender.com/api-docs |

A API está no plano gratuito do Render: se estiver parada, o primeiro pedido pode demorar até um minuto. O front-end avisa quando isso acontece.

## Estrutura

```text
frontend/     Interface web (HTML, CSS e JS com Fetch API)
backend/      API REST com Node.js, Express e MongoDB Atlas (Mongoose, MVC)
mock-server/  API simulada com json-server
mock-data/    bd.json original
tests/        Coleção de testes do Postman
```

Dentro de `backend/src/`: `models/` (Curso, Aluno, Counter), `controllers/`, `routes/`, `config/` (ligação à base de dados), `docs/` (Swagger) e `seed/` (importação do `bd.json`).

## Como correr

### API simulada (json-server)

```bash
cd mock-server
npm install
npm start
```

Fica em `http://localhost:3000` e serve também a pasta `frontend`.

### API real (Node.js + MongoDB Atlas)

```bash
cd backend
npm install
```

1. Copiar `.env.example` para `.env` e preencher `MONGODB_URI` com a connection string do Atlas. No Atlas, em Network Access, é preciso permitir o IP de quem corre a API (ou `0.0.0.0/0`).
2. `npm run seed` importa o `bd.json` para o Atlas. Apaga e recria as coleções.
3. `npm run dev` (ou `npm start`). Fica em `http://localhost:3000`, com o Swagger em `/api-docs`.

Se o json-server e a API real correrem ao mesmo tempo, definir `PORT` no `.env` com outra porta.

### Front-end

A morada da API está no início de `frontend/script.js` e de `frontend/matriz.js` (`API_URL`). Por omissão aponta para a API no Render. Para usar uma API local, trocar para `http://localhost:3000`. Pode abrir-se com a extensão Live Server ou através do `mock-server`.

## Páginas do front-end

- **Alunos** (`index.html`): quadro com uma coluna por ano curricular. Permite criar, editar e apagar alunos, filtrar por curso e **arrastar um aluno para outra coluna** para mudar o ano.
- **Matriz** (`matriz.html`, botão "#"): quantos alunos há em cada curso e ano, com totais, lista dos alunos de cada célula e versão para imprimir.

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/cursos` | Lista cursos |
| GET | `/cursos/:id` | Obtém um curso |
| GET | `/cursos/:id/alunos` | Alunos de um curso |
| POST | `/cursos` | Cria curso |
| PUT | `/cursos/:id` | Atualiza curso |
| DELETE | `/cursos/:id` | Apaga curso (409 se tiver alunos) |
| GET | `/alunos` | Lista alunos (filtros `?idCurso=` e `?anoCurricular=`) |
| GET | `/alunos/:id` | Obtém um aluno |
| POST | `/alunos` | Cria aluno |
| PUT | `/alunos/:id` | Atualiza aluno |
| DELETE | `/alunos/:id` | Apaga aluno |

Corpo de um aluno: `{ "nome", "apelido", "idCurso", "anoCurricular" }`. A documentação completa, com exemplos, está no Swagger.

## Testes

A coleção do Postman (CRUD de alunos e leitura de cursos) está em `tests/`.

## Notas

- Os ids de alunos e cursos são números sequenciais (1, 2, 3, …), como no `bd.json`. A API atribui-os ao criar, através de um contador na coleção `counters`.
- `idCurso` referencia o id do curso. A API valida que o curso existe e não deixa apagar um curso que ainda tenha alunos.
- As credenciais ficam só no `.env` (fora do Git) e nas variáveis de ambiente do Render.