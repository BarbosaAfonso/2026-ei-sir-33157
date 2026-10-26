const mongoose = require('mongoose');

const alunoSchema = new mongoose.Schema(
  {
    nome: { type: String, required: [true, 'nome é obrigatório'], trim: true },
    apelido: { type: String, required: [true, 'apelido é obrigatório'], trim: true },
    idCurso: {
      type: mongoose.Schema.Types.ObjectId,
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
        ret.id = ret._id.toString();
        delete ret._id;
        if (ret.idCurso) ret.idCurso = ret.idCurso.toString();
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('Aluno', alunoSchema, 'alunos');