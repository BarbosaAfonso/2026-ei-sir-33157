const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema(
  {
    nomeDoCurso: { type: String, required: [true, 'nomeDoCurso é obrigatório'], trim: true }
  },
  { versionKey: false }
);

module.exports = mongoose.model('Curso', cursoSchema, 'cursos');
