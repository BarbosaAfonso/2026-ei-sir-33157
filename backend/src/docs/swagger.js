// Especificação OpenAPI 3.0 da API (servida em /api-docs)
const idParam = (descricao) => ({
  name: 'id',
  in: 'path',
  required: true,
  description: descricao,
  schema: { type: 'string', example: '6650f1c2a1b2c3d4e5f60718' }
});

const erro = (descricao) => ({
  description: descricao,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } }
});

const json = (schema) => ({ 'application/json': { schema } });

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'API Escola',
    version: '1.0.0',
    description: 'API REST (Express + MongoDB Atlas) para gerir cursos e alunos.'
  },
  servers: [{ url: '/', description: 'Servidor atual' }],
  tags: [
    { name: 'Cursos', description: 'Gestão de cursos' },
    { name: 'Alunos', description: 'Gestão de alunos' }
  ],
  paths: {
    '/cursos': {
      get: {
        tags: ['Cursos'],
        summary: 'Lista todos os cursos',
        responses: {
          200: {
            description: 'Lista de cursos',
            content: json({ type: 'array', items: { $ref: '#/components/schemas/Curso' } })
          }
        }
      },
      post: {
        tags: ['Cursos'],
        summary: 'Cria um curso',
        requestBody: {
          required: true,
          content: json({ $ref: '#/components/schemas/CursoInput' })
        },
        responses: {
          201: { description: 'Curso criado', content: json({ $ref: '#/components/schemas/Curso' }) },
          400: erro('Dados inválidos')
        }
      }
    },
    '/cursos/{id}': {
      get: {
        tags: ['Cursos'],
        summary: 'Obtém um curso',
        parameters: [idParam('ID do curso')],
        responses: {
          200: { description: 'Curso', content: json({ $ref: '#/components/schemas/Curso' }) },
          400: erro('ID inválido'),
          404: erro('Curso não encontrado')
        }
      },
      put: {
        tags: ['Cursos'],
        summary: 'Atualiza um curso',
        parameters: [idParam('ID do curso')],
        requestBody: {
          required: true,
          content: json({ $ref: '#/components/schemas/CursoInput' })
        },
        responses: {
          200: { description: 'Curso atualizado', content: json({ $ref: '#/components/schemas/Curso' }) },
          400: erro('Dados ou ID inválidos'),
          404: erro('Curso não encontrado')
        }
      },
      delete: {
        tags: ['Cursos'],
        summary: 'Apaga um curso (só se não tiver alunos)',
        parameters: [idParam('ID do curso')],
        responses: {
          200: { description: 'Curso apagado', content: json({ $ref: '#/components/schemas/Mensagem' }) },
          400: erro('ID inválido'),
          404: erro('Curso não encontrado'),
          409: erro('O curso tem alunos associados')
        }
      }
    },
    '/cursos/{id}/alunos': {
      get: {
        tags: ['Cursos'],
        summary: 'Lista os alunos de um curso',
        parameters: [idParam('ID do curso')],
        responses: {
          200: {
            description: 'Alunos do curso',
            content: json({ type: 'array', items: { $ref: '#/components/schemas/Aluno' } })
          },
          400: erro('ID inválido'),
          404: erro('Curso não encontrado')
        }
      }
    },
    '/alunos': {
      get: {
        tags: ['Alunos'],
        summary: 'Lista alunos (com filtros opcionais)',
        parameters: [
          {
            name: 'idCurso',
            in: 'query',
            description: 'Filtrar por curso',
            schema: { type: 'string', example: '6650f1c2a1b2c3d4e5f60718' }
          },
          {
            name: 'anoCurricular',
            in: 'query',
            description: 'Filtrar por ano curricular',
            schema: { type: 'integer', example: 3 }
          }
        ],
        responses: {
          200: {
            description: 'Lista de alunos (com o curso preenchido)',
            content: json({ type: 'array', items: { $ref: '#/components/schemas/AlunoComCurso' } })
          }
        }
      },
      post: {
        tags: ['Alunos'],
        summary: 'Cria um aluno',
        requestBody: {
          required: true,
          content: json({ $ref: '#/components/schemas/AlunoInput' })
        },
        responses: {
          201: { description: 'Aluno criado', content: json({ $ref: '#/components/schemas/Aluno' }) },
          400: erro('Dados inválidos ou idCurso inexistente')
        }
      }
    },
    '/alunos/{id}': {
      get: {
        tags: ['Alunos'],
        summary: 'Obtém um aluno',
        parameters: [idParam('ID do aluno')],
        responses: {
          200: { description: 'Aluno', content: json({ $ref: '#/components/schemas/AlunoComCurso' }) },
          400: erro('ID inválido'),
          404: erro('Aluno não encontrado')
        }
      },
      put: {
        tags: ['Alunos'],
        summary: 'Atualiza um aluno',
        parameters: [idParam('ID do aluno')],
        requestBody: {
          required: true,
          content: json({ $ref: '#/components/schemas/AlunoInput' })
        },
        responses: {
          200: { description: 'Aluno atualizado', content: json({ $ref: '#/components/schemas/Aluno' }) },
          400: erro('Dados ou ID inválidos'),
          404: erro('Aluno não encontrado')
        }
      },
      delete: {
        tags: ['Alunos'],
        summary: 'Apaga um aluno',
        parameters: [idParam('ID do aluno')],
        responses: {
          200: { description: 'Aluno apagado', content: json({ $ref: '#/components/schemas/Mensagem' }) },
          400: erro('ID inválido'),
          404: erro('Aluno não encontrado')
        }
      }
    }
  },
  components: {
    schemas: {
      Curso: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6650f1c2a1b2c3d4e5f60718' },
          nomeDoCurso: { type: 'string', example: 'Engenharia Informática' }
        }
      },
      CursoInput: {
        type: 'object',
        required: ['nomeDoCurso'],
        properties: { nomeDoCurso: { type: 'string', example: 'Engenharia Informática' } }
      },
      Aluno: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6650f1c2a1b2c3d4e5f60999' },
          nome: { type: 'string', example: 'Afonso' },
          apelido: { type: 'string', example: 'Barbosa' },
          idCurso: { type: 'string', example: '6650f1c2a1b2c3d4e5f60718' },
          anoCurricular: { type: 'integer', example: 3 }
        }
      },
      AlunoComCurso: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6650f1c2a1b2c3d4e5f60999' },
          nome: { type: 'string', example: 'Afonso' },
          apelido: { type: 'string', example: 'Barbosa' },
          idCurso: { $ref: '#/components/schemas/Curso' },
          anoCurricular: { type: 'integer', example: 3 }
        }
      },
      AlunoInput: {
        type: 'object',
        required: ['nome', 'apelido', 'idCurso', 'anoCurricular'],
        properties: {
          nome: { type: 'string', example: 'Afonso' },
          apelido: { type: 'string', example: 'Barbosa' },
          idCurso: { type: 'string', example: '6650f1c2a1b2c3d4e5f60718' },
          anoCurricular: { type: 'integer', minimum: 1, example: 3 }
        }
      },
      Mensagem: {
        type: 'object',
        properties: { mensagem: { type: 'string', example: 'Apagado com sucesso' } }
      },
      Erro: {
        type: 'object',
        properties: { erro: { type: 'string', example: 'Não encontrado' } }
      }
    }
  }
};
