// ============================================
// Train Routes
// ============================================
const express = require('express');
const router = express.Router();
const { searchTrains, getTrainById, getAllTrains, createTrain, deleteTrain } = require('../controllers/trainController');

router.get('/search', searchTrains);
router.get('/:id', getTrainById);
router.get('/', getAllTrains);
router.post('/', createTrain);
router.delete('/:id', deleteTrain);

module.exports = router;
