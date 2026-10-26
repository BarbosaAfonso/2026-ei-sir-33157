const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema(
  {
    nomeDoCurso: { type: String, required: [true, 'nomeDoCurso é obrigatório'], trim: true }
  },
  {
    versionKey: false,
    // Devolve "id" (string) em vez de "_id", igual ao bd.json
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('Curso', cursoSchema, 'cursos');