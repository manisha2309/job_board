const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect: authMiddleware } = require('../middleware/auth');

// Extract text from PDF using pdf2json
async function extractPdfText(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const PDFParser = require('pdf2json');
      const pdfParser = new PDFParser();

      pdfParser.on('pdfParser_dataError', (err) => {
        reject(new Error('PDF parse error: ' + err.parserError));
      });

      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        try {
          let text = '';
          if (pdfData && pdfData.Pages) {
            pdfData.Pages.forEach(page => {
              if (page.Texts) {
                page.Texts.forEach(textItem => {
                  if (textItem.R) {
                    textItem.R.forEach(r => {
                      try {
                        text += decodeURIComponent(r.T) + ' ';
                      } catch (e) {
                        text += r.T + ' '; // use raw if decode fails
                      }
                    });
                  }
                });
                text += '\n';
              }
            });
          }
          resolve(text.trim());
        } catch (e) {
          reject(e);
        }
      });

      pdfParser.loadPDF(filePath);
    } catch (e) {
      reject(e);
    }
  });
}

// POST /api/analyze-resume/:applicationId
router.post('/:applicationId', authMiddleware, async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId).populate('job');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Return cached result if exists
    if (
      application.aiAnalysis &&
      application.aiAnalysis.matchScore !== undefined &&
      application.aiAnalysis.matchScore !== null
    ) {
      return res.json({ analysis: application.aiAnalysis });
    }

    const uploadsDir = path.join(__dirname, '../uploads');
    const resumeFile = application.resumeFile || application.resume;

    if (!resumeFile) {
      return res.status(400).json({ message: 'No resume file found for this application' });
    }

    const resumePath = path.join(uploadsDir, path.basename(resumeFile));
    console.log('Extracting text from:', path.basename(resumeFile));

    if (!fs.existsSync(resumePath)) {
      return res.status(404).json({ message: 'Resume file not found: ' + resumePath });
    }

    let resumeText = '';
    try {
      resumeText = await extractPdfText(resumePath);
      console.log('Resume text extracted:', resumeText.length, 'chars');
      if (resumeText.length > 0) console.log('Sample:', resumeText.substring(0, 100));
    } catch (pdfErr) {
      console.error('PDF extraction failed:', pdfErr.message);
      return res.status(500).json({ message: 'Could not read PDF: ' + pdfErr.message });
    }

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({ message: 'Could not extract text from PDF. Make sure it is a text-based PDF, not a scanned image.' });
    }

    const job = application.job;
    const jobDescription = `Title: ${job.title || 'N/A'}
Company: ${job.company || 'N/A'}
Description: ${job.description || 'N/A'}
Requirements: ${Array.isArray(job.requirements) ? job.requirements.join(', ') : (job.requirements || 'N/A')}
Skills: ${Array.isArray(job.skills) ? job.skills.join(', ') : (job.skills || 'N/A')}`;

    console.log('Calling Groq API...');
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        temperature: 0.3,
        max_tokens: 1500,
        messages: [
          {
            role: 'system',
            content: 'You are an expert ATS resume analyzer. Always respond with valid JSON only. No markdown, no explanation, just the JSON object.'
          },
          {
            role: 'user',
            content: `Analyze this resume against the job description and return ONLY a JSON object.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText.substring(0, 3000)}

Return this exact JSON structure (no markdown, no backticks, just raw JSON):
{
  "matchScore": <number 0-100>,
  "recommendation": "<Strong Match|Good Match|Partial Match|Weak Match>",
  "summary": "<2-3 sentence assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>"],
  "keywordsMatched": ["<keyword1>", "<keyword2>", "<keyword3>"],
  "keywordsMissing": ["<keyword1>", "<keyword2>"],
  "improvementTips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}`
          }
        ]
      })
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error('Groq API error:', errText);
      return res.status(500).json({ message: 'Groq API error: ' + errText });
    }

    const groqData = await groqResponse.json();
    const rawContent = groqData.choices?.[0]?.message?.content || '';
    console.log('Groq raw response:', rawContent.substring(0, 200));

    let analysis;
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON object found in response');
      analysis = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr.message);
      return res.status(500).json({ message: 'Failed to parse AI response: ' + parseErr.message });
    }

    const safeAnalysis = {
      matchScore: typeof analysis.matchScore === 'number' ? analysis.matchScore : 50,
      recommendation: analysis.recommendation || 'Partial Match',
      summary: analysis.summary || 'Analysis completed.',
      strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
      gaps: Array.isArray(analysis.gaps) ? analysis.gaps : [],
      keywordsMatched: Array.isArray(analysis.keywordsMatched) ? analysis.keywordsMatched : [],
      keywordsMissing: Array.isArray(analysis.keywordsMissing) ? analysis.keywordsMissing : [],
      improvementTips: Array.isArray(analysis.improvementTips) ? analysis.improvementTips : [],
    };

    console.log('Score:', safeAnalysis.matchScore, '| Rec:', safeAnalysis.recommendation);

    application.aiAnalysis = safeAnalysis;
    application.aiAnalyzedAt = new Date();
    await application.save();

    res.json({ analysis: safeAnalysis });

  } catch (err) {
    console.error('Resume analysis error:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;