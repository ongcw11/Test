// models/member.js
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: String,
  birthdate: String,
  address: String,
});

module.exports = mongoose.model('Member', memberSchema);
