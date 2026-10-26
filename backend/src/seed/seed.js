// Importa os dados de bd.json para o MongoDB Atlas.
// Uso: npm run seed   (apaga e volta a criar as coleções cursos e alunos)
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Curso = require('../models/Curso');
const Aluno = require('../models/Aluno');
const dados = require(path.join(__dirname, 'bd.json'));

(async () => {
  await connectDB();
  await Aluno.deleteMany();
  await Curso.deleteMany();

  // Mapeia os ids antigos ("1", "2", ...) para os novos ObjectId
  const mapaCursos = {};
  for (const c of dados.cursos) {
    const criado = await Curso.create({ nomeDoCurso: c.nomeDoCurso });
    mapaCursos[c.id] = criado._id;
  }

  for (const a of dados.alunos) {
    await Aluno.create({
      nome: a.nome,
      apelido: a.apelido,
      idCurso: mapaCursos[a.idCurso],
      anoCurricular: a.anoCurricular
    });
  }

  console.log(`Importados ${dados.cursos.length} cursos e ${dados.alunos.length} alunos`);
  await mongoose.disconnect();
})();
