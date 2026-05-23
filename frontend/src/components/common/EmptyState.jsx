const EmptyState = ({ title = "No data found", message = "Nothing to show here." }) => {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;