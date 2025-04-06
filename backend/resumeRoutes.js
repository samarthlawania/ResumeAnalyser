const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Resume = require('./models/Resume');
const fs = require('fs-extra');
const path = require('path');
const { OpenAI } = require('openai');
const { PDFDocument } = require('pdf-lib');
const { analyzeResume } = require('./aiCalling');


const extractTextFromPDF = async (filePath) => {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  };
  
  const extractContactInfo = (text) => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g;
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{4}/g;
  
    const emails = text.match(emailRegex) || [];
    const phones = text.match(phoneRegex) || [];
  
    return {
      emails,
      phones,
    };
  };
// Multer config
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const extractedText = await extractTextFromPDF(filePath);
    const contactInfo = extractContactInfo(extractedText);
    
    const resume = new Resume({
        email: contactInfo.emails?.[0] || "Not Found",
        phone: contactInfo.phones?.[0] || "Not Found",
     });

     console.log(resume)
    await resume.save();
    const aiReview = await analyzeResume(extractedText);
    const resumeText = await extractTextFromPDF(filePath );
    const aiResult = await analyzeResume(aiReview.enhancedResume);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const fontSize = 12;
    let y = page.getHeight() - 30;

    const lines = aiResult.enhancedResume.split('\n');
    lines.forEach(line => {
      if (y < 30) {
        page = pdfDoc.addPage();
        y = page.getHeight() - 30;
      }
      page.drawText(line, { x: 30, y, size: fontSize });
      y -= fontSize + 2;
    });

    const enhancedPdfBytes = await pdfDoc.save();
    const outputPath = path.join(__dirname, '../downloads', `${Date.now()}_enhanced_resume.pdf`);
    await fs.writeFile(outputPath, enhancedPdfBytes);

    res.status(200).json({ message: 'Resume uploaded and parsed successfully!', resume,aiReview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process resume.' });
  }
});

module.exports = router;
