const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect, authorize } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC files are allowed'));
    }
  }
});

const { sendApplicationConfirmation, sendApplicationNotification, sendStatusUpdate } = require('../config/email');

router.post('/', protect, authorize('candidate'), upload.single('resume'), async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    const job = await Job.findById(jobId).populate('employer');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      coverLetter,
      resume: req.file ? req.file.filename : ''
    });

    job.applicationCount += 1;
    await job.save();

    // Send email notifications (async, don't wait)
    sendApplicationConfirmation(req.user.email, job.title, job.company);
    sendApplicationNotification(job.employer.email, req.user.name, job.title);

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// router.post('/', protect, authorize('candidate'), upload.single('resume'), async (req, res) => {
//   try {
//     const { jobId, coverLetter } = req.body;

//     const job = await Job.findById(jobId);
//     if (!job) {
//       return res.status(404).json({ message: 'Job not found' });
//     }

//     if (job.status !== 'active') {
//       return res.status(400).json({ message: 'This job is no longer accepting applications' });
//     }

//     const existingApplication = await Application.findOne({
//       job: jobId,
//       candidate: req.user._id
//     });

//     if (existingApplication) {
//       return res.status(400).json({ message: 'You have already applied for this job' });
//     }

//     const application = await Application.create({
//       job: jobId,
//       candidate: req.user._id,
//       coverLetter,
//       resume: req.file ? req.file.filename : ''
//     });

//     job.applicationCount += 1;
//     await job.save();

//     res.status(201).json(application);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

router.get('/my-applications', protect, authorize('candidate'), async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate('job')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/job/:jobId', protect, authorize('employer'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these applications' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name email phone skills experience education')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// const { sendStatusUpdate } = require('../config/email');

router.put('/:id/status', protect, authorize('employer'), async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('candidate');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    // Send status update email (async, don't wait)
    sendStatusUpdate(application.candidate.email, application.job.title, status);

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// router.put('/:id/status', protect, authorize('employer'), async (req, res) => {
//   try {
//     const { status } = req.body;
//     const application = await Application.findById(req.params.id).populate('job');

//     if (!application) {
//       return res.status(404).json({ message: 'Application not found' });
//     }

//     if (application.job.employer.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: 'Not authorized to update this application' });
//     }

//     application.status = status;
//     await application.save();

//     res.json(application);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

module.exports = router;