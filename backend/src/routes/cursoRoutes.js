const router = require('express').Router();
const ctrl = require('../controllers/cursoController');

router.get('/', ctrl.listar);
router.get('/:id', ctrl.obter);
router.get('/:id/alunos', ctrl.listarAlunos);
router.post('/', ctrl.criar);
router.put('/:id', ctrl.atualizar);
router.delete('/:id', ctrl.apagar);

module.exports = router;
