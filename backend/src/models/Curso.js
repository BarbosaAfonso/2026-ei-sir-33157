const mongoose = require('mongoose');
const { nextId } = require('./Counter');

const cursoSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    nomeDoCurso: { type: String, required: [true, 'nomeDoCurso é obrigatório'], trim: true }
  },
  {
    versionKey: false,
    // Devolve "id" (string, como no bd.json) em vez de "_id"
    toJSON: {
      transform: (doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      }
    }
  }
);

// Atribui o id sequencial ao criar
cursoSchema.pre('validate', async function () {
  if (this.isNew && this._id == null) this._id = await nextId('cursos');
});

module.exports = mongoose.model('Curso', cursoSchema, 'cursos');