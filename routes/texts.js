'use strict';

const express = require('express');
const router = express.Router();
const Texto = require('../models/text');

// POST Creating on DB new Text
router.post('/create', (req, res, next) => {
  
  const { title, textBody } = req.body;  
  const owner = req.session.currentUser._id;

  Texto.create({ owner, title, textBody })
      .then(() => {          
        res.status(200).json(Texto);
      })
      .catch(next);      
});

module.exports = router;