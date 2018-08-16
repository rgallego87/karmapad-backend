'use strict';

const express = require('express');
const router = express.Router();
const Texto = require('../models/text');

// GET HomePage All text from all users
router.get('/', (req, res, next) => {
  Texto.find()
      .populate('owner')
      .then((texts) => {          
          res.status(200).json(texts);
      })
      .catch(next);
});

module.exports = router;