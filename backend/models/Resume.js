const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  textContent: String,
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resume', ResumeSchema);
