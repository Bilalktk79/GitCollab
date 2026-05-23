import "../styles/pages.css";

const Signup = () => {
  return (
    <div className="page">
      <h1 className="page-title">Signup</h1>
      <div className="underline"></div>

      <form className="auth-card">
        <input type="text" placeholder="Username" />
        <input type="email" placeholder="Email Address" />
        <input type="password" placeholder="Password" />

        <button className="primary-btn" type="button">
          Create Account
        </button>
      </form>
    </div>
  );
};

export default Signup;