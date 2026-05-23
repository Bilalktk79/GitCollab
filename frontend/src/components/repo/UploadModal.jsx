import { useState } from "react";

const UploadModal = ({ owner, repoName, onUpload, onClose }) => {
  const [filePath, setFilePath] = useState("");
  const [content, setContent] = useState("");
  const [commitMessage, setCommitMessage] = useState("Add file");
  const [branch, setBranch] = useState("main");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await onUpload(owner, repoName, {
        file_path: filePath,
        content,
        commit_message: commitMessage,
        branch,
      });

      alert("File uploaded successfully");
      onClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="auth-card">
        <h2>Upload File</h2>

        <form onSubmit={submitHandler}>
          <input
            type="text"
            placeholder="example: src/App.jsx"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            required
          />

          <textarea
            placeholder="File content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Commit message"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
          />

          <input
            type="text"
            placeholder="Branch"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          />

          <button className="primary-btn" disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </button>

          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;