const Curso = require('../models/Curso');
const Aluno = require('../models/Aluno');

// GET /cursos
exports.listar = async (req, res, next) => {
  try {
    res.json(await Curso.find());
  } catch (err) {
    next(err);
  }
};

// GET /cursos/:id
exports.obter = async (req, res, next) => {
  try {
    const curso = await Curso.findById(req.params.id);
    if (!curso) return res.status(404).json({ erro: 'Curso não encontrado' });
    res.json(curso);
  } catch (err) {
    next(err);
  }
};

// GET /cursos/:id/alunos
exports.listarAlunos = async (req, res, next) => {
  try {
    const curso = await Curso.findById(req.params.id);
    if (!curso) return res.status(404).json({ erro: 'Curso não encontrado' });
    res.json(await Aluno.find({ idCurso: curso._id }));
  } catch (err) {
    next(err);
  }
};

// POST /cursos
exports.criar = async (req, res, next) => {
  try {
    const curso = await Curso.create({ nomeDoCurso: req.body.nomeDoCurso });
    res.status(201).json(curso);
  } catch (err) {
    next(err);
  }
};

// PUT /cursos/:id
exports.atualizar = async (req, res, next) => {
  try {
    const curso = await Curso.findByIdAndUpdate(
      req.params.id,
      { nomeDoCurso: req.body.nomeDoCurso },
      { new: true, runValidators: true }
    );
    if (!curso) return res.status(404).json({ erro: 'Curso não encontrado' });
    res.json(curso);
  } catch (err) {
    next(err);
  }
};

// DELETE /cursos/:id
exports.apagar = async (req, res, next) => {
  try {
    const temAlunos = await Aluno.exists({ idCurso: req.params.id });
    if (temAlunos) {
      return res.status(409).json({ erro: 'Não é possível apagar um curso que tem alunos associados' });
    }
    const curso = await Curso.findByIdAndDelete(req.params.id);
    if (!curso) return res.status(404).json({ erro: 'Curso não encontrado' });
    res.json({ mensagem: 'Curso apagado' });
  } catch (err) {
    next(err);
  }
};
