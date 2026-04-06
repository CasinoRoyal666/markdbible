import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import MarkdownRenderer from "../components/MarkdownRenderer.jsx";
import { useSettings } from '../context/SettingsContext.jsx';
import { translations } from '../locales/translations.js';
const apiUrl = import.meta.env.VITE_API_URL;
function SharedNote() {
    const { publicId } = useParams();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const { language } = useSettings();
    const t = translations[language];
    useEffect(() => {
        const fetchNote = async () => {
            try {
                const response = await axios.get(`${apiUrl}shared/${publicId}/`);
                setNote(response.data);
            } catch (error) {
                console.error("Note not found", error)
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        fetchNote();
    }, [publicId]);
    if (loading) {
        return (
            <div className="shared-note-loading">
                {t.loading}
            </div>
        );
    }
    if (notFound) {
        return (
            <div className="shared-note-notfound">
                <div className="shared-note-notfound-title">{t.noteNotFoundTitle}</div>
                <div className="shared-note-notfound-desc">{t.noteNotFoundDesc}</div>
            </div>
        );
    }
    return (
        <div className="shared-note-container">
            <div className="shared-note-header">
                {t.sharedNoteReadOnly}
            </div>
            <h1 className="shared-note-title">
                {note.title}
            </h1>
            <div className="shared-note-content">
                <MarkdownRenderer content={note.content} interactive={false} />
            </div>
        </div>
    );
}
export default SharedNote;