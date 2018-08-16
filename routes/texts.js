'use strict';

const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;
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

// GET texts listing only logged user texts
router.get('/', (req, res, next) => {
  const oid = req.session.currentUser._id;  
  Texto.find({'owner': ObjectId(oid)})
      .populate('owner')
      .then((data) => {
        console.log(data);
        res.status(200).json(data);
      })
      .catch(next);
});

module.exports = router;