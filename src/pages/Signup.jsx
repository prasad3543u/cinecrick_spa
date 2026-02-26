import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Signup.css";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    dob: "",
    interest: ""
  });

  const [showPwd, setShowPwd] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.email || !form.password || !form.dob || !form.interest) {
      alert("Please fill all fields");
      return;
    }

    // ✅ Save user
    localStorage.setItem("cinecrick_user", JSON.stringify(form));

    // ✅ Redirect ONLY after signup
    navigate("/home");
  }

  return (
    <div className="signup-page">

      <div className="overlay" />

      {/* LOGO */}
      <h1 className="logo">CineCrick</h1>

      {/* CARD */}
      <div className="signup-card">

        <h2>Create Account</h2>
        <p className="subtitle">
          Movies 🎬 + Cricket 🏏 in one place
        </p>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <input
              name="email"
              type="email"
              required
              onChange={handleChange}
            />
            <label>Email Address</label>
          </div>

          <div className="input-group">
            <input
              name="password"
              type={showPwd ? "text" : "password"}
              required
              onChange={handleChange}
            />
            <label>Password</label>

            <span
              className="eye"
              onClick={() => setShowPwd(!showPwd)}
            >
              {showPwd ? "🙈" : "👁️"}
            </span>
          </div>

          <div className="input-group">
            <input
              name="dob"
              type="date"
              required
              onChange={handleChange}
            />
            <label className="date-label">Date of Birth</label>
          </div>

          <div className="input-group">
            <select name="interest" required onChange={handleChange}>
              <option value=""></option>
              <option>Cricket</option>
              <option>Movies</option>
              <option>Both</option>
            </select>
            <label>Select Interest</label>
          </div>

          <button className="signup-btn">
            Get Started →
          </button>

        </form>

      </div>
    </div>
  );
}