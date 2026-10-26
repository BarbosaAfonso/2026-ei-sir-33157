const mongoose = require('mongoose');
const { nextId } = require('./Counter');

const alunoSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    nome: { type: String, required: [true, 'nome é obrigatório'], trim: true },
    apelido: { type: String, required: [true, 'apelido é obrigatório'], trim: true },
    idCurso: {
      type: Number,
      ref: 'Curso',
      required: [true, 'idCurso é obrigatório']
    },
    anoCurricular: {
      type: Number,
      required: [true, 'anoCurricular é obrigatório'],
      min: [1, 'anoCurricular mínimo é 1']
    }
  },
  {
    versionKey: false,
    // Devolve "id" e "idCurso" como strings, igual ao bd.json
    toJSON: {
      transform: (doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        if (ret.idCurso != null) ret.idCurso = String(ret.idCurso);
        return ret;
      }
    }
  }
);

// Atribui o id sequencial ao criar
alunoSchema.pre('validate', async function () {
  if (this.isNew && this._id == null) this._id = await nextId('alunos');
});

module.exports = mongoose.model('Aluno', alunoSchema, 'alunos');