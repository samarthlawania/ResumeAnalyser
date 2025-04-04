import React, { useState } from "react";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("resume", file);

    setUploading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Resume uploaded successfully!");
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 to-black text-white px-4">
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
    </div>
  );
};

export default ResumeUpload;
