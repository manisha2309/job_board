const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    default: ''
  },
  resume: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },

  // Groq AI Analysis
  aiAnalysis: {
    matchScore:      { type: Number },
    summary:         { type: String },
    strengths:       [{ type: String }],
    gaps:            [{ type: String }],
    keywordsMatched: [{ type: String }],
    keywordsMissing: [{ type: String }],
    recommendation:  { type: String },
    improvementTips: [{ type: String }]
  },
  aiAnalyzedAt: {
    type: Date
  }
});

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);