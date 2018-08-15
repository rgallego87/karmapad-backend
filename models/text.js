'use strict';

const mongoose = require("mongoose");
const Schema   = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const textoSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  owner: {
    type: ObjectId, 
    ref: 'User'
  }
}, {
  timestamps: true
});

const Texto = mongoose.model('Text', textoSchema);

module.exports = Texto;