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
  let language = '';
  let textFound = '';     
  Texto.findById(id)
    .then(text => {        
      if(!text) {
        throw {code: 'not-found', status: 404};
      }
      textFound = text;
    })
    .then(() => {      
      let preDocuments_lang = { 'documents': [
        { 'id': id, 'text': textFound.textBody }          
      ]};         
      return getFromAzure(preDocuments_lang,'languages');        
    })
    .then(langDetected => {
      language = langDetected['documents'][0].detectedLanguages[0].iso6391Name;           
      let preDocuments = { 'documents': [
        { 'id': id, 'language': language, 'text': textFound.textBody }          
      ]};      
      return getFromAzure(preDocuments,'sentiment');
    })
    .then((response) => {                    
      res.status(200).json(response);
    }) 
    .catch(error => {
      console.log(error);
      return res.status(error.status).send(error.code);
    });
});


module.exports = router;