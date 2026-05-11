import React, { useState } from "react";
import api from "../api.js";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext.jsx";
import { translations } from "../locales/translations.js";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { language } = useSettings();
  const t = translations[language];

  const validateUsername = (value) => {
    if (!value.trim()) return t.validationUsernameRequired;
    if (value.length < 3 || value.length > 30)
      return t.validationUsernameLength;
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) return t.validationUsernameChars;
    return "";
  };

  const validateEmail = (value) => {
    if (!value.trim()) return t.validationEmailRequired;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return t.validationEmailFormat;
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return t.validationPasswordRequired;
    if (value.length < 6) return t.validationPasswordLength;
    return "";
  };

  const validate = () => {
    const newErrors = {
      username: validateUsername(username),
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(newErrors);
    setServerError("");
    return !newErrors.username && !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post("register/", { username, password, email });
      alert(t.registeredSuccess);
      navigate("/login");
    } catch (error) {
      const data = error.response?.data;
      if (data) {
        const serverErrors = {};
        if (data.username) serverErrors.username = data.username.join(", ");
        if (data.email) serverErrors.email = data.email.join(", ");
        if (data.password) serverErrors.password = data.password.join(", ");
        if (Object.keys(serverErrors).length > 0) {
          setErrors(serverErrors);
        } else {
          setServerError(typeof data === "string" ? data : t.registerError);
        }
      } else {
        setServerError(t.registerError);
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (field, value) => {
    let msg = "";
    if (field === "username") msg = validateUsername(value);
    if (field === "email") msg = validateEmail(value);
    if (field === "password") msg = validatePassword(value);
    setErrors((prev) => ({ ...prev, [field]: msg }));
  };

  return (
    <div className="auth-container">
      <h2>{t.registerTitle}</h2>
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="auth-field">
          <input
            type="text"
            placeholder={t.usernamePlaceholder}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => handleBlur("username", username)}
            className={`auth-input ${errors.username ? "auth-input--error" : ""}`}
          />
          {errors.username && (
            <span className="auth-error-text">{errors.username}</span>
          )}
        </div>

        <div className="auth-field">
          <input
            type="email"
            placeholder={t.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur("email", email)}
            className={`auth-input ${errors.email ? "auth-input--error" : ""}`}
          />
          {errors.email && (
            <span className="auth-error-text">{errors.email}</span>
          )}
        </div>

        <div className="auth-field">
          <input
            type="password"
            placeholder={t.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur("password", password)}
            className={`auth-input ${errors.password ? "auth-input--error" : ""}`}
          />
          {errors.password && (
            <span className="auth-error-text">{errors.password}</span>
          )}
        </div>

        {serverError && <div className="auth-server-error">{serverError}</div>}

        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? t.creating : t.register}
        </button>
      </form>
      <p className="auth-link">
        {t.alreadyHaveAccount} <a href="/login">{t.login}</a>
      </p>
    </div>
  );
}

export default Register;
