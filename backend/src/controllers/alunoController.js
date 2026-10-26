const Aluno = require('../models/Aluno');
const Curso = require('../models/Curso');

// GET /alunos?idCurso=...&anoCurricular=...
exports.listar = async (req, res, next) => {
  try {
    const filtro = {};
    if (req.query.idCurso) filtro.idCurso = req.query.idCurso;
    if (req.query.anoCurricular) filtro.anoCurricular = Number(req.query.anoCurricular);
    res.json(await Aluno.find(filtro).populate('idCurso', 'nomeDoCurso'));
  } catch (err) {
    next(err);
  }
};

// GET /alunos/:id
exports.obter = async (req, res, next) => {
  try {
    const aluno = await Aluno.findById(req.params.id).populate('idCurso', 'nomeDoCurso');
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado' });
    res.json(aluno);
  } catch (err) {
    next(err);
  }
};

// POST /alunos
exports.criar = async (req, res, next) => {
  try {
    const { nome, apelido, idCurso, anoCurricular } = req.body;
    if (idCurso && !(await Curso.exists({ _id: idCurso }))) {
      return res.status(400).json({ erro: 'idCurso não corresponde a nenhum curso' });
    }
    const aluno = await Aluno.create({ nome, apelido, idCurso, anoCurricular });
    res.status(201).json(aluno);
  } catch (err) {
    next(err);
  }
};

// PUT /alunos/:id
exports.atualizar = async (req, res, next) => {
  try {
    const { nome, apelido, idCurso, anoCurricular } = req.body;
    if (idCurso && !(await Curso.exists({ _id: idCurso }))) {
      return res.status(400).json({ erro: 'idCurso não corresponde a nenhum curso' });
    }
    const aluno = await Aluno.findByIdAndUpdate(
      req.params.id,
      { nome, apelido, idCurso, anoCurricular },
      { new: true, runValidators: true }
    );
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado' });
    res.json(aluno);
  } catch (err) {
    next(err);
  }
};

// DELETE /alunos/:id
exports.apagar = async (req, res, next) => {
  try {
    const aluno = await Aluno.findByIdAndDelete(req.params.id);
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado' });
    res.json({ mensagem: 'Aluno apagado' });
  } catch (err) {
    next(err);
  }
};
