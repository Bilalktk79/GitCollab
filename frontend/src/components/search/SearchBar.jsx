const SearchBar = ({ value, onChange, placeholder = "Search repositories..." }) => {
  return (
    <div className="search-box">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;