import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import MarkdownRenderer from "../components/MarkdownRenderer.jsx";

const apiUrl = import.meta.env.VITE_API_URL;

function SharedNote() {
    const { publicId } = useParams();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const response = await axios.get(`${apiUrl}shared/${publicId}/`);
                setNote(response.data);
            } catch (error) {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        fetchNote();
    }, [publicId]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1e1e1e', color: '#aaa' }}>
                Loading...
            </div>
        );
    }

    if (notFound) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1e1e1e', color: '#aaa' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Note not found</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>This note does not exist or is not public</div>
            </div>
        );
    }
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', background: '#1e1e1e', minHeight: '100vh', color: '#d4d4d4' }}>
            <div style={{ marginBottom: '8px', fontSize: '0.8rem', color: '#666' }}>
                Shared note · read only
            </div>
            <h1 style={{ color: '#e8e8e8', marginBottom: '24px', borderBottom: '1px solid #3e3e42', paddingBottom: '16px' }}>
                {note.title}
            </h1>
            <div style={{ lineHeight: '1.7' }}>
                <MarkdownRenderer content={note.content} interactive={false}/>
            </div>
        </div>
    );
}

export default SharedNote;