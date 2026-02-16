import React, { useEffect, useState } from 'react';
import api from './api';

function App() {
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await api.get('notes/');
                console.log(response.data);
                setNotes(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchNotes();
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1>My Notes</h1>

            <ul>
                {notes.map(note => (
                    <li key={note.id}>
                        <strong>{note.title}</strong>
                        <span style={{ color: 'gray', marginLeft: '10px' }}>
              (Updated: {new Date(note.updated_at).toLocaleDateString()})
            </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;