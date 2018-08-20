'use strict';

const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const Texto = require('../models/text');
const getFromAzure = require('../helper');

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
        res.status(200).json(data);
      })
      .catch(next);
});

// GET rendering by text id a single text
router.get('/:id', (req, res, next) => {
  const { id } = req.params;    
  Texto.findById(id)
      .then((text) => {        
        if(!text) {
          return res.status(404).json({code: 'not-found'});
        } else {          
          return res.status(200).json(text);
        }
      })
      .catch(next);      
});

// POST to Microsoft Azure Cognitive Sentiment API
router.post('/:id/analyze', (req, res, next) => {   
  const { id } = req.params;    
  Texto.findById(id)
      .then((text) => {        
        if(!text) {
          return res.status(404).json({code: 'not-found'});
        } else {          
        // Parsing text to document Microsoft Azure API pattern
            let preDocuments = { 'documents': [
          { 'id': id, 'language': 'es', 'text': text.textBody }          
          ]};
          console.log(preDocuments);

          getFromAzure(preDocuments)
            .then((response) => {
              console.log("respuesta", response)
              res.status(200).json(response)
            })
            .catch((error) => {
              console.log(error);
            })
        }
      })
      .catch(next);    

});

module.exports = router;