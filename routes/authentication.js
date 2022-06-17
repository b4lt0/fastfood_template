const express = require('express');
const router = express.Router();
const authenticationController = require('../controllers/authenticationController');

router.post('/', authenticationController.handleLogin);

module.exports = router;