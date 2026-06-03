import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, FileText, Network, Link2, FolderTree, ArrowRight, PenLine, Share2, Search } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';
import { translations } from '../locales/translations.js';
import Logo from '../components/Logo';
import "../App.css";

function Landing() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { language, theme, toggleTheme, toggleLanguage } = useSettings();
    const t = translations[language];

    useEffect(() => {
        const token = localStorage.getItem('access');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    return (
        <div className="landing-container">
            <header className="landing-header">
                <Link to="/" className="landing-logo-link">
                    <Logo size="sm" />
                </Link>
                <nav className="landing-nav">
                    <button
                        onClick={toggleLanguage}
                        className="theme-toggle-btn"
                        title={t.languageLabel}
                    >
                        {language.toUpperCase()}
                    </button>
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle-btn"
                        title={t.themeLabel}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {isLoggedIn ? (
                        <Link to="/app" className="landing-btn-primary">{t.landing_go_to_app}</Link>
                    ) : (
                        <>
                            <Link to="/login" className="landing-nav-link">{t.login}</Link>
                            <Link to="/register" className="landing-btn-primary">{t.landing_get_started}</Link>
                        </>
                    )}
                </nav>
            </header>

            <main className="landing-main">
                <section className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">{t.landing_hero_title}</h1>
                        <p className="hero-subtitle">{t.landing_hero_subtitle}</p>
                        <div className="hero-actions">
                            {isLoggedIn ? (
                                <Link to="/app" className="hero-btn-primary">
                                    {t.landing_open_workspace}
                                    <ArrowRight size={18} />
                                </Link>
                            ) : (
                                <Link to="/register" className="hero-btn-primary">
                                    {t.landing_start_writing}
                                    <ArrowRight size={18} />
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                <section className="features-section">
                    <div className="features-header">
                        <h2 className="section-title">{t.landing_features_title}</h2>
                        <p className="section-subtitle">{t.landing_features_subtitle}</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon-wrap">
                                <FileText size={22} strokeWidth={1.5} />
                            </div>
                            <h3>{t.landing_feature_markdown_title}</h3>
                            <p>{t.landing_feature_markdown_desc}</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon-wrap">
                                <Network size={22} strokeWidth={1.5} />
                            </div>
                            <h3>{t.landing_feature_graph_title}</h3>
                            <p>{t.landing_feature_graph_desc}</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon-wrap">
                                <Link2 size={22} strokeWidth={1.5} />
                            </div>
                            <h3>{t.landing_feature_links_title}</h3>
                            <p>{t.landing_feature_links_desc}</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon-wrap">
                                <FolderTree size={22} strokeWidth={1.5} />
                            </div>
                            <h3>{t.landing_feature_organization_title}</h3>
                            <p>{t.landing_feature_organization_desc}</p>
                        </div>
                    </div>
                </section>

                <section className="workflow-section">
                    <h2 className="section-title">{t.landing_workflow_title}</h2>
                    <div className="workflow-grid">
                        <div className="workflow-step">
                            <div className="workflow-step-num">01</div>
                            <div className="workflow-step-content">
                                <h3>{t.landing_workflow_write_title}</h3>
                                <p>{t.landing_workflow_write_desc}</p>
                            </div>
                        </div>
                        <div className="workflow-step">
                            <div className="workflow-step-num">02</div>
                            <div className="workflow-step-content">
                                <h3>{t.landing_workflow_link_title}</h3>
                                <p>{t.landing_workflow_link_desc}</p>
                            </div>
                        </div>
                        <div className="workflow-step">
                            <div className="workflow-step-num">03</div>
                            <div className="workflow-step-content">
                                <h3>{t.landing_workflow_discover_title}</h3>
                                <p>{t.landing_workflow_discover_desc}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="cta-section">
                    <div className="cta-inner">
                        <h2>{t.landing_cta_title}</h2>
                        <p>{t.landing_cta_subtitle}</p>
                        <div className="cta-actions">
                            {isLoggedIn ? (
                                <Link to="/app" className="hero-btn-primary">
                                    {t.landing_open_workspace}
                                    <ArrowRight size={18} />
                                </Link>
                            ) : (
                                <Link to="/register" className="hero-btn-primary">
                                    {t.landing_start_writing}
                                    <ArrowRight size={18} />
                                </Link>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <div className="footer-inner">
                    <div className="footer-brand">
                        <Logo size="sm" />
                    </div>
                    <div className="footer-meta">
                        <span>&copy; {new Date().getFullYear()} MarkDBible</span>
                        <span className="footer-dot">&middot;</span>
                        <span>{t.landing_all_rights_reserved}</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
