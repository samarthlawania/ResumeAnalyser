const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Resume = require('./models/Resume');


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
    res.status(200).json({ message: 'Resume uploaded and parsed successfully!', resume });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process resume.' });
  }
});

module.exports = router;
