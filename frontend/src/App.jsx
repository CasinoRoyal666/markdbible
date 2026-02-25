import React, {useEffect, useState} from 'react';
import "./App.css"
import api from "./api";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";

function App() {
    const [notes, setNotes] = useState([]);
    const [activeNoteId, setActiveNoteId] = useState(null);
    const [saveStatus, setSaveStatus] = useState("Saved");

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await api.get('notes/');
                const notesData = response.data;
                setNotes(notesData);
            } catch (error) {
                console.error(error);
            }
        }
        fetchNotes();
    }, []);

    const addNote = async () => {
        try {
            const response = await api.post('notes/', {
                title: "Empty Note",
                content: ""
            });
            const newNote = response.data;
            setNotes([newNote, ...notes]);
            setActiveNoteId(newNote.id);
        } catch (error) {
            console.error(error);
        }
    };

    const onUpdateNote = (updatedNote) => {
        const updatedNotesArray = notes.map((note) => {
            if (note.id === updatedNote.id) {
                return updatedNote;
            }
            return note;
        });
        setNotes(updatedNotesArray);
        setSaveStatus("Unsaved");
    };

    const onSelectNote = async (noteId) => {
        setActiveNoteId(noteId);

        try {
            const response = await api.get(`notes/${noteId}/`);
            const fullNoteData = response.data;
            setNotes(prevNotes => prevNotes.map(n =>
                n.id === noteId ? fullNoteData : n
            ));
        } catch (error) {
            console.error("Error loading full note:", error);
        }
    };

    const activeNote = notes.find((note) => note.id === activeNoteId);

    useEffect(() => {
        if (!activeNote || saveStatus === 'Saved') return;
        const timeoutId = setTimeout(async () => {
            setSaveStatus("Saving...");
            try {
                await api.patch(`notes/${activeNote.id}/`, {
                    title: activeNote.title,
                    content: activeNote.content
                });
                setSaveStatus("Saved");
                console.log("auto-saved!");
            } catch (error) {
                console.error("error while auto-save: ", error);
                setSaveStatus("Error");
            }
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [activeNote, saveStatus]);

    return (
        <div className="app-container">
            <Sidebar
                notes={notes}
                activeNoteId={activeNoteId}
                onSelectNote={onSelectNote}
                onAddNote={addNote}
            />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{
                    textAlign: 'right',
                    padding: '5px 20px',
                    fontSize: '0.8rem',
                    color: saveStatus === 'Error' ? 'red' : '#666'
                }}>
                    {saveStatus}
                </div>

                <Editor
                    activeNote={activeNote}
                    onUpdateNote={onUpdateNote}
                />
            </div>
        </div>
    );
}

export default App;