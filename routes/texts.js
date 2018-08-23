'use strict';

const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const Texto = require('../models/text');
const getFromAzure = require('../azure-helpers');
// Dandelion Text Analysis API
const dandelion = require("../fixed_packs/node-dandelion");
dandelion.configure({  
  "token": process.env.DANDELION_API_KEY  
});

// POST Creating on DB new Text
router.post('/create', (req, res, next) => {
  
  const { title, textBody } = req.body;  
  const owner = req.session.currentUser._id;

  Texto.create({ owner, title, textBody })
      .then(() => {          
        res.status(200).send();
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

// POST Updating text by id on DB
router.post('/:id', (req, res, next) => {
  const { id } = req.params;
  const { title, textBody } = req.body;
  Job.findByIdAndUpdate(id, { title, textBody })
      .then(() => {
        res.status(200).json(response);
      })
      .catch(next);
});

// POST Deleting a single text on DB
router.post('/:id/delete', (req, res, next) => {  
  Texto.findByIdAndRemove(req.params.id)
    .then(() => {              
      res.status(204).send();
    })
    .catch(next); 
});

// POST to Microsoft Azure Cognitive Sentiment API
router.post('/:id/analyze', (req, res, next) => {   
  const { id } = req.params;
  let language = {};
  let keyPhrases = {};
  let entities = {};
  let documentProcessed = {};
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
      language = langDetected['documents'][0].detectedLanguages[0];           
      let preDocuments_sentiment = { 'documents': [
        { 'id': id, 'language': language.iso6391Name, 'text': textFound.textBody }          
      ]};      
      return getFromAzure(preDocuments_sentiment,'sentiment');
    })
    .then(sentimentProcessed => {
      documentProcessed = sentimentProcessed;
    })
    .then(() => {                             
      let preDocuments_keyPhrases = { 'documents': [
        { 'id': id, 'language': language.iso6391Name, 'text': textFound.textBody }          
      ]};      
      return getFromAzure(preDocuments_keyPhrases,'keyPhrases');
    })
    .then(document => {
      keyPhrases = document['documents'][0].keyPhrases;            
    })
    .then(() => {            
      if (language.iso6391Name === 'en') {
        let preDocuments_entities = { 'documents': [
          { 'id': id, 'language': 'en', 'text': textFound.textBody }          
        ]};      
        return getFromAzure(preDocuments_entities,'entities');
      }
    })
    .then(document => {
      if (document) {
        entities = document['documents'][0].entities;      
      }      
    })
    .then(() => {      
      let response = { 
        documentProcessed, 
        language: language.name, 
        keyPhrases,
        entities
      };
      res.status(200).json(response);
    }) 
    .catch(error => {
      console.log(error);
      return res.status(error.status).send(error.code);
    });
});

// POST to Dandelion using contextualize categories
router.post('/:id/contextualize', (req, res, next) => {   
  const { id } = req.params;  
  let textFound = '';       
  Texto.findById(id)
    .then(text => {        
      if(!text) {
        throw {code: 'not-found', status: 404};
      }
      textFound = text;      
    })    
    .then(() => {      
      let textPreCategory = {
        "string":{
          "type": "txt",
          "value": textFound.textBody
        },
        "model": "8513d03c-7aaa-4599-b90e-f0ce012ab11b"
      }
      return new Promise((resolve,reject) => {
        dandelion.txtCl(textPreCategory, (response, status) => {          
          if (status === 200) {
            return resolve(response);
          } 
          reject(response);
         })
      })              
    })
    .then(response => {      
      res.status(200).json(response);                   
    })      
    .catch(error => {
      console.log(error);
      return res.status(error.status).send(error.code);
    });
});

module.exports = router;