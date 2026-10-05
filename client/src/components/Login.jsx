import '../styles/auth.css';

function Login() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Login to Gakuran</h2>
        
        <form className="auth-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />
          </div>
          
          <button type="submit" className="auth-btn">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;