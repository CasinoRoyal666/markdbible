import React, { useState } from "react";
import api from '../api.js';
import { useNavigate } from "react-router-dom";
import { useSettings } from '../context/SettingsContext.jsx';
import { translations } from '../locales/translations.js';
function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const navigate = useNavigate();
    const { language } = useSettings();
    const t = translations[language];
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("password-reset/", { email });
            setSent(true);
        } catch (error) {
            setSent(true);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="auth-container">
            <h2>{t.forgotPasswordTitle}</h2>
            {sent ? (
                <div className="reset-success">
                    <p className="reset-message">{t.resetEmailSent}</p>
                    <button
                        className="auth-btn"
                        onClick={() => navigate("/login")}
                    >
                        {t.goToLogin}
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="email"
                        placeholder={t.emailPlaceholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="auth-input"
                        required
                    />
                    <button type="submit" disabled={loading} className="auth-btn">
                        {loading ? "..." : t.sendResetLink}
                    </button>
                </form>
            )}
            <p className="auth-link">
                <a href="/login">{t.login}</a>
            </p>
        </div>
    );
}
export default ForgotPassword;