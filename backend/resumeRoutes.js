const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Resume = require('./models/Resume');
const fs = require('fs-extra');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
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

async function preparePdfForDownload(aiResult){
  const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const fontSize = 12;
  //  const customFont = await pdfDoc.embedFont(fontBytes);
    // let y = page.getHeight() - 30;
    // const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    // const lines = aiResult.enhancedResume.split('\n');
    // lines.forEach(line => {
    //   line = line.replace(/[^\x00-\x7F]/g, "");
    //   if (y < 30) {
    //     page = pdfDoc.addPage();
    //     y = page.getHeight() - 30;
    //   }
    //   page.drawText(line, { x: 30, y,font,color: rgb(0, 0, 0)});
    //   y -= fontSize + 2;
    // });
    // const enhancedPdfBytes = await pdfDoc.save();
    // const outputDir = path.join(__dirname, '/downloads');
    // await fs.promises.mkdir(outputDir, { recursive: true });
    
    // const outputPath = path.join(outputDir, `${Date.now()}_enhanced_resume.pdf`);
    // await fs.promises.writeFile(outputPath, enhancedPdfBytes);
    
}

router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    console.log("efsdfcz")
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
    const aiResult = await analyzeResume(aiReview.enhancedResume);

     await  preparePdfForDownload(aiResult)
    res.status(200).json({ message: 'Resume uploaded and parsed successfully!', resume,aiResult });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process resume.' });
  }
});



module.exports = router;
