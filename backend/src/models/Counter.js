const mongoose = require('mongoose');

// Guarda o último id atribuído a cada coleção (ex.: { _id: 'alunos', seq: 6 })
const counterSchema = new mongoose.Schema(
  { _id: { type: String }, seq: { type: Number, default: 0 } },
  { versionKey: false }
);

const Counter = mongoose.model('Counter', counterSchema, 'counters');

// Devolve o próximo id (1, 2, 3, ...) de forma atómica
async function nextId(nome) {
  const c = await Counter.findOneAndUpdate(
    { _id: nome },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return c.seq;
}

module.exports = { Counter, nextId };
