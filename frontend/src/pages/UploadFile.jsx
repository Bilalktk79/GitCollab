import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRepo } from "../context/repoContext";
import { uploadFile } from "../services/repoService";

import "../styles/pages.css";
import "../styles/repo.css";

const UploadFile = () => {
  const navigate = useNavigate();
  const { repos, fetchRepos } = useRepo();

  const [selectedRepo, setSelectedRepo] = useState("");
  const [filePath, setFilePath] = useState("");
  const [content, setContent] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [branch, setBranch] = useState("main");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchRepos();
  }, []);

  const handleFileChoose = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setFilePath(file.name);

    const reader = new FileReader();

    reader.onload = () => {
      setContent(reader.result);
    };

    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRepo) {
      alert("Please select a repository");
      return;
    }

    if (!filePath.trim()) {
      alert("Please enter file path");
      return;
    }

    if (!content.trim()) {
      alert("Please write file content or choose a file");
      return;
    }

    if (!commitMessage.trim()) {
      alert("Please enter commit message");
      return;
    }

    const repo = repos.find((item) => String(item.id) === selectedRepo);

    if (!repo) {
      alert("Selected repository not found");
      return;
    }

    const owner = repo.owner?.login;
    const repoName = repo.name;
    const username = localStorage.getItem("username") || owner || "";

    const fileData = {
      file_path: filePath,
      content,
      commit_message: commitMessage,
      branch: branch || "main",
      developer_id: username,
      developer_name: username,
    };

    try {
      setLoading(true);
      setMessage("");

      const result = await uploadFile(owner, repoName, fileData);

      console.log("Upload result:", result);

      if (result?.commit_review?.commit_id) {
        setMessage(
          `File uploaded successfully! Commit Review created. Commit ID: ${result.commit_review.commit_id}`
        );
      } else {
        setMessage("File uploaded and committed successfully!");
      }

      setFilePath("");
      setContent("");
      setCommitMessage("");
      setBranch("main");
      setSelectedRepo("");
    } catch (error) {
      console.error("Upload error:", error);

      setMessage(
        error?.response?.data?.detail ||
          "Failed to upload file. Check repo name, branch, token permission, or backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Upload File</h1>
      <div className="underline"></div>

      <div className="upload-card">
        <form onSubmit={handleSubmit}>
          <label>Select Repository</label>
          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
          >
            <option value="">Choose repository</option>

            {repos.map((repo) => (
              <option key={repo.id} value={repo.id}>
                {repo.owner?.login}/{repo.name}
              </option>
            ))}
          </select>

          <label>File Path</label>
          <input
            type="text"
            placeholder="README.md or src/App.jsx or docs/notes.txt"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
          />

          <label>Choose File</label>
          <input type="file" onChange={handleFileChoose} />

          <label>File Content</label>
          <textarea
            rows="9"
            placeholder="Write file content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>

          <label>Commit Message</label>
          <input
            type="text"
            placeholder="Add new file"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
          />

          <label>Branch</label>
          <input
            type="text"
            placeholder="main"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          />

          <div className="upload-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate(-1)}
            >
              Back
            </button>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Uploading..." : "Upload File"}
            </button>
          </div>
        </form>

        {message && <p className="upload-message">{message}</p>}
      </div>
    </div>
  );
};

export default UploadFile;