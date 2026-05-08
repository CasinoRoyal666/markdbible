import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Sun, ChevronDown } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';
import { translations } from '../locales/translations.js';
import Logo from '../components/Logo';
import GraphAnimation from '../components/GraphAnimation';
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
            <GraphAnimation />
            
            <header className="landing-header">
                <Link to="/" className="landing-logo-link">
                    <Logo size="sm" />
                </Link>
                <nav className="landing-nav">
                    <button 
                        onClick={toggleLanguage}
                        className="theme-toggle-btn"
                        style={{ fontWeight: 'bold', fontSize: '0.8rem' }}
                        title={t.languageLabel}
                    >
                        {language.toUpperCase()}
                    </button>
                    <button 
                        onClick={toggleTheme}
                        className="theme-toggle-btn"
                        title={t.themeLabel}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
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
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="hero-logo-wrapper">
                            <Logo size="xl" className="hero-logo-animation" />
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.4 }}
                                transition={{ delay: 0.6 }}
                                className="hero-tagline"
                            >
                                {t.landing_hero_tagline || 'The geometric spiritual interface'}
                            </motion.p>
                        </div>

                        <h1 className="hero-title">{t.landing_hero_title}</h1>
                        <p className="hero-subtitle">
                            {t.landing_hero_subtitle}
                        </p>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="hero-actions"
                        >
                            {isLoggedIn ? (
                                <Link to="/app" className="hero-btn-large">{t.landing_open_workspace}</Link>
                            ) : (
                                <Link to="/register" className="hero-btn-large">{t.landing_start_writing}</Link>
                            )}
                        </motion.div>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="scroll-indicator"
                    >
                        <ChevronDown size={32} />
                    </motion.div>
                </section>

                <section className="features-section" id="features">
                    <h2 className="section-title">{t.landing_features_title || 'Features'}</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">📝</div>
                            <h3>{t.landing_feature_markdown_title}</h3>
                            <p>{t.landing_feature_markdown_desc}</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🕸️</div>
                            <h3>{t.landing_feature_graph_title}</h3>
                            <p>{t.landing_feature_graph_desc}</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🔗</div>
                            <h3>{t.landing_feature_links_title}</h3>
                            <p>{t.landing_feature_links_desc}</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📂</div>
                            <h3>{t.landing_feature_organization_title}</h3>
                            <p>{t.landing_feature_organization_desc}</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <p>&copy; {new Date().getFullYear()} MarkDBible. {t.landing_all_rights_reserved}</p>
                <div className="footer-tagline">EST. 2026 / MARKDBIBLE PROJECT</div>
            </footer>
        </div>
    );
}

export default Landing;
