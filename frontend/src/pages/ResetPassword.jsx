import React, { useState } from "react";
import api from '../api.js';
import { useNavigate, useParams } from "react-router-dom";
import { useSettings } from '../context/SettingsContext.jsx';
import { translations } from '../locales/translations.js';
function ResetPassword() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const { language } = useSettings();
    const t = translations[language];
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (newPassword !== confirmPassword) {
            setError(t.passwordsDoNotMatch);
            return;
        }
        setLoading(true);
        try {
            await api.post("password-reset-confirm/", {
                uid,
                token,
                new_password1: newPassword,
                new_password2: confirmPassword,
            });
            setSuccess(true);
        } catch (error) {
            setError(t.passwordResetExpired);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    if (success) {
        return (
            <div className="auth-container">
                <h2>{t.resetPasswordTitle}</h2>
                <div className="reset-success">
                    <p className="reset-message">{t.passwordResetSuccess}</p>
                    <button
                        className="auth-btn"
                        onClick={() => navigate("/login")}
                    >
                        {t.goToLogin}
                    </button>
                </div>
            </div>
        );
    }
    return (
        <div className="auth-container">
            <h2>{t.resetPasswordTitle}</h2>
            {error && <p className="reset-error">{error}</p>}
            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    type="password"
                    placeholder={t.newPasswordPlaceholder}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="auth-input"
                    required
                />
                <input
                    type="password"
                    placeholder={t.confirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="auth-input"
                    required
                />
                <button type="submit" disabled={loading} className="auth-btn">
                    {loading ? "..." : t.resetPasswordBtn}
                </button>
            </form>
            <p className="auth-link">
                <a href="/login">{t.login}</a>
            </p>
        </div>
    );
}
export default ResetPassword;