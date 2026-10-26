// Importa os dados de bd.json para o MongoDB Atlas, mantendo os ids 1, 2, 3, ...
// Uso: npm run seed   (apaga e volta a criar cursos, alunos e contadores)
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Curso = require('../models/Curso');
const Aluno = require('../models/Aluno');
const { Counter } = require('../models/Counter');
const dados = require(path.join(__dirname, 'bd.json'));

(async () => {
  await connectDB();
  await Aluno.deleteMany();
  await Curso.deleteMany();
  await Counter.deleteMany();

  for (const c of dados.cursos) {
    await Curso.create({ _id: Number(c.id), nomeDoCurso: c.nomeDoCurso });
  }
  for (const a of dados.alunos) {
    await Aluno.create({
      _id: Number(a.id),
      nome: a.nome,
      apelido: a.apelido,
      idCurso: Number(a.idCurso),
      anoCurricular: a.anoCurricular
    });
  }

  // O próximo id continua a partir do maior existente
  await Counter.create({ _id: 'cursos', seq: Math.max(...dados.cursos.map((c) => Number(c.id))) });
  await Counter.create({ _id: 'alunos', seq: Math.max(...dados.alunos.map((a) => Number(a.id))) });

  console.log(`Importados ${dados.cursos.length} cursos e ${dados.alunos.length} alunos`);
  await mongoose.disconnect();
})();