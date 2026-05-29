import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useSettings } from "../context/SettingsContext.jsx";
import { translations } from "../locales/translations.js";
import Logo from "../components/Logo";
import "../App.css";

function Landing() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { language, theme, toggleTheme, toggleLanguage } = useSettings();
  const t = translations[language];

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="landing">
      <header className="landing-header">
        <Link to="/" className="landing-logo-link">
          <Logo size="sm" />
        </Link>
        <nav className="landing-nav">
          <button
            onClick={toggleLanguage}
            className="landing-toggle"
            title={t.languageLabel}
          >
            {language.toUpperCase()}
          </button>
          <button
            onClick={toggleTheme}
            className="landing-toggle"
            title={t.themeLabel}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {isLoggedIn ? (
            <Link to="/app" className="landing-cta">
              {t.landing_go_to_app}
            </Link>
          ) : (
            <>
              <Link to="/login" className="landing-link">
                {t.login}
              </Link>
              <Link to="/register" className="landing-cta">
                {t.landing_get_started}
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="landing-main">
        <motion.section
          className="landing-hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="landing-hero-content">
            <motion.div
              className="landing-hero-badge"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {t.landing_hero_tagline || "The geometric spiritual interface"}
            </motion.div>

            <motion.h1
              className="landing-hero-title"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {t.landing_hero_title}
            </motion.h1>

            <motion.p
              className="landing-hero-subtitle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
            >
              {t.landing_hero_subtitle}
            </motion.p>

            <motion.div
              className="landing-hero-actions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {isLoggedIn ? (
                <Link to="/app" className="landing-btn-primary">
                  {t.landing_open_workspace}
                </Link>
              ) : (
                <Link to="/register" className="landing-btn-primary">
                  {t.landing_start_writing}
                </Link>
              )}
            </motion.div>
          </div>

          <motion.div
            className="landing-hero-visual"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="landing-editor-preview">
              <div className="landing-editor-chrome">
                <span className="landing-dot" />
                <span className="landing-dot" />
                <span className="landing-dot" />
                <span className="landing-editor-tab">note.md</span>
              </div>
              <div className="landing-editor-body">
                <div className="landing-editor-line">
                  <span className="landing-line-num">1</span>
                  <span className="landing-line-hl"># {t.landing_editor_line1}</span>
                </div>
                <div className="landing-editor-line">
                  <span className="landing-line-num">2</span>
                  <span />
                </div>
                <div className="landing-editor-line">
                  <span className="landing-line-num">3</span>
                  <span><span className="landing-line-kw">{t.landing_editor_line3_kw}</span> {t.landing_editor_line3_rest} <span className="landing-line-link">[[WikiLinks]]</span></span>
                </div>
                <div className="landing-editor-line">
                  <span className="landing-line-num">4</span>
                  <span><span className="landing-line-kw">{t.landing_editor_line4_kw}</span> {t.landing_editor_line4_rest}</span>
                </div>
                <div className="landing-editor-line">
                  <span className="landing-line-num">5</span>
                  <span />
                </div>
                <div className="landing-editor-line">
                  <span className="landing-line-num">6</span>
                  <span><span className="landing-line-tag">{t.landing_editor_tag1}</span>{" "}<span className="landing-line-tag">{t.landing_editor_tag2}</span></span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        <motion.section
          className="landing-features"
          id="features"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="landing-section-title">
            {t.landing_features_title || "Features"}
          </h2>
          <div className="landing-features-grid">
            <div className="landing-feature">
              <div className="landing-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h3 className="landing-feature-title">
                {t.landing_feature_markdown_title}
              </h3>
              <p className="landing-feature-desc">
                {t.landing_feature_markdown_desc}
              </p>
            </div>

            <div className="landing-feature">
              <div className="landing-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="5" cy="6" r="2" />
                  <circle cx="19" cy="6" r="2" />
                  <circle cx="5" cy="18" r="2" />
                  <circle cx="19" cy="18" r="2" />
                  <line x1="7" y1="7.5" x2="10.5" y2="10.5" />
                  <line x1="13.5" y1="10.5" x2="17" y2="7.5" />
                  <line x1="7" y1="16.5" x2="10.5" y2="13.5" />
                  <line x1="13.5" y1="13.5" x2="17" y2="16.5" />
                </svg>
              </div>
              <h3 className="landing-feature-title">
                {t.landing_feature_graph_title}
              </h3>
              <p className="landing-feature-desc">
                {t.landing_feature_graph_desc}
              </p>
            </div>

            <div className="landing-feature">
              <div className="landing-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <h3 className="landing-feature-title">
                {t.landing_feature_links_title}
              </h3>
              <p className="landing-feature-desc">
                {t.landing_feature_links_desc}
              </p>
            </div>

            <div className="landing-feature">
              <div className="landing-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="landing-feature-title">
                {t.landing_feature_organization_title}
              </h3>
              <p className="landing-feature-desc">
                {t.landing_feature_organization_desc}
              </p>
            </div>
          </div>
        </motion.section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <span>&copy; {new Date().getFullYear()} MarkDBible</span>
          <span className="landing-footer-sep">&middot;</span>
          <span>{t.landing_all_rights_reserved}</span>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
