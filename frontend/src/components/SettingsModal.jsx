import React from "react";
import { useSettings } from "../context/SettingsContext.jsx";
import { translations } from "../locales/translations.js";

const SettingsModal = ({ isOpen, onClose }) => {
    const { language, theme, toggleLanguage, toggleTheme } = useSettings();
    const t = translations[language];

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    ×
                </button>
                <h2 className="modal-title">{t.settingsTitle}</h2>

                <div className="modal-row">
                    <span className="modal-label">{t.languageLabel}</span>
                    <div className="toggle-switch" onClick={toggleLanguage}>
                        <div className={`toggle-thumb ${language === 'ru' ? 'right' : ''}`} />
                    </div>
                    <span className="toggle-label">
                        {language === 'en' ? t.langEnglish : t.langRussian}
                    </span>
                </div>

                <div className="modal-row">
                    <span className="modal-label">{t.themeLabel}</span>
                    <div className="toggle-switch" onClick={toggleTheme}>
                        <div className={`toggle-thumb ${theme === 'light' ? 'right' : ''}`} />
                    </div>
                    <span className="toggle-label">
                        {theme === 'dark' ? t.themeDark : t.themeLight}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;