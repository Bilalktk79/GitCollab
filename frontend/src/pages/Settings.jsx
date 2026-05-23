import "../styles/pages.css";

const Settings = () => {
  return (
    <div className="page">
      <h1 className="page-title">Settings</h1>
      <div className="underline"></div>

      <div className="form-card">
        <label>Theme</label>
        <select>
          <option>Dark Orange</option>
        </select>

        <label>Default Repository Visibility</label>
        <select>
          <option>Public</option>
          <option>Private</option>
        </select>

        <button className="primary-btn">Save Settings</button>
      </div>
    </div>
  );
};

export default Settings;