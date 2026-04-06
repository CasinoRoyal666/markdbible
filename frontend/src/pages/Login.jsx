import React, { useState } from "react";
import api from '../api.js';
import { useNavigate } from "react-router-dom";
import { useSettings } from '../context/SettingsContext.jsx';
import { translations } from '../locales/translations.js';

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { language } = useSettings();
    const t = translations[language];
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("token/", { username, password });
            localStorage.setItem("access", res.data.access);
            localStorage.setItem("refresh", res.data.refresh);
            localStorage.setItem("username", username);
            navigate("/");
        } catch (error) {
            alert(t.authError);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="auth-container">
            <h2>{t.loginTitle}</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    type="text"
                    placeholder={t.usernamePlaceholder}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="auth-input"
                />
                <input
                    type="password"
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input"
                />
                <button type="submit" disabled={loading} className="auth-btn">
                    {loading ? t.loggingIn : t.login}
                </button>
            </form>
            <p className="auth-link">
                {t.noAccount} <a href="/register">{t.registration}</a>
            </p>
        </div>
    );
}


export default Login;