const FileCard = ({ file }) => {
  return (
    <div className="repo-card">
      <h3>{file?.name || "File"}</h3>
      <p>Path: {file?.path || "N/A"}</p>
      <p>Type: {file?.type || "file"}</p>

      {file?.html_url && (
        <a className="primary-btn" href={file.html_url} target="_blank" rel="noreferrer">
          Open File
        </a>
      )}
    </div>
  );
};

export default FileCard;