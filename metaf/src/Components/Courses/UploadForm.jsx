import React, { useState } from "react";
import "./Course.css"; // Make sure to add this CSS file

const UploadForm = ({ onSubmit, loading }) => {
  const [course, setCourse] = useState("");
  const [platform, setPlatform] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files); // Convert FileList to an array
    setMediaFiles(files);

    const newPreviews = files.map((file) => {
      const fileType = file.type.split("/")[0];
      if (fileType === "image") {
        return URL.createObjectURL(file); // Preview image
      } else if (fileType === "audio") {
        return URL.createObjectURL(file); // Preview audio
      } else if (fileType === "video") {
        return URL.createObjectURL(file); // Preview video
      } else if (file.type === "application/pdf") {
        return "pdf"; // Mark as PDF type
      }
      return null;
    });
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("username", localStorage.getItem("username"));
    formData.append("course_name", course);
    formData.append("platform", platform);
    mediaFiles.forEach((file) => formData.append("certificate", file));

    await onSubmit(formData);
  };

  return (
    <div className="upload-form">
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <input
            type="text"
            placeholder="Course Name"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <input
            type="text"
            placeholder="Platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <input
            type="file"
            placeholder="Certificate"
            accept="image/*,video/*,audio/*,application/pdf"
            onChange={handleMediaChange}
          />
        </div>

        {/* Preview Container */}
      {previews.length > 0 && (
        <div className="preview-container" style={{ marginTop: "10px" }}>
          {previews.map((preview, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              {preview.type === "image" ? (
                <img
                  src={preview.url}
                  alt={`Preview ${index + 1}`}
                  style={{ width: "300px", height: "auto" }}
                />
              ) : preview.type === "video" ? (
                <video controls style={{ width: "300px", height: "auto" }}>
                  <source src={preview.url} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "#007bff",
                    fontWeight: "bold",
                  }}
                >
                  {preview.name}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
