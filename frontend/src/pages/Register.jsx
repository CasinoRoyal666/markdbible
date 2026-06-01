import React, { useState } from "react";
import api from "../api.js";
import { useNavigate } from "react-router-dom";
import { useSettings } from '../context/SettingsContext.jsx';
import { translations } from '../locales/translations.js';

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { language } = useSettings();
    const t = translations[language];
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("register/", { username, password, email });
            alert(t.registeredSuccess);
            navigate("/login");
        } catch (error) {
            alert(t.registerError);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="auth-container">
            <h2>{t.registerTitle}</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    type="text"
                    placeholder={t.usernamePlaceholder}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="auth-input"
                />
                <input
                    type="email"
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input"
                    required
                />
                <input
                    type="password"
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input"
                />
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