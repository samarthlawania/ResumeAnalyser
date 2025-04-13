import React, { useState } from "react";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [resumeData, setResumeData] = useState(null); // For AI result

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("resume", file);

    setUploading(true);
    setMessage("");
    setResumeData(null);

    try {
      const res = await fetch("http://localhost:5000/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "✅ Resume uploaded successfully!");
        setResumeData(data); // Save entire response
      } else {
        setMessage("❌ Upload failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Server error.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-slate-900 to-black text-white px-4 py-8">
      <h1 className="text-4xl font-bold mb-4 text-center">🚀 AI Resume Uploader</h1>
      <p className="text-lg text-gray-300 mb-8 text-center">
        Upload your resume and let AI analyze your skills!
      </p>

      <div className="bg-slate-800 p-6 rounded-xl shadow-lg w-full max-w-md text-center">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4 w-full text-white"
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition w-full"
        >
          {uploading ? "Uploading..." : "Upload Resume"}
        </button>
        {message && <p className="mt-4">{message}</p>}
      </div>

      {resumeData?.aiResult && (
        <div className="mt-10 w-full max-w-4xl">
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg mb-6">
            <h2 className="text-2xl font-bold mb-4 text-green-400">✅ AI Analysis Result</h2>

            <p><strong>Email:</strong> {resumeData.resume.email}</p>
            <p><strong>Phone:</strong> {resumeData.resume.phone}</p>
            <p><strong>Uploaded At:</strong> {new Date(resumeData.resume.uploadedAt).toLocaleString()}</p>

            <div className="my-4 flex space-x-4">
              <div>
                <p className="font-semibold">ATS Score Before</p>
                <div className="bg-gray-600 h-4 w-40 rounded">
                  <div
                    className="bg-red-500 h-4 rounded"
                    style={{ width: `${resumeData.aiResult.atsscorebefore}%` }}
                  ></div>
                </div>
                <p>{resumeData.aiResult.atsscorebefore}%</p>
              </div>

              <div>
                <p className="font-semibold">ATS Score After</p>
                <div className="bg-gray-600 h-4 w-40 rounded">
                  <div
                    className="bg-green-500 h-4 rounded"
                    style={{ width: `${resumeData.aiResult.atsscoreafter}%` }}
                  ></div>
                </div>
                <p>{resumeData.aiResult.atsscoreafter}%</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold text-red-400 mb-2">❌ Issues</h3>
              <ul className="list-disc list-inside text-sm">
                {resumeData.aiResult.issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold text-blue-400 mb-2">💡 Suggestions</h3>
              <ul className="list-disc list-inside text-sm">
                {resumeData.aiResult.suggestions.map((suggestion, idx) => (
                  <li key={idx}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-yellow-400">📄 Enhanced Resume</h3>
            <textarea
              readOnly
              className="w-full h-[500px] p-3 rounded-lg bg-slate-900 text-white border border-slate-600 whitespace-pre-line text-sm"
              value={resumeData.aiResult.enhancedResume}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
