import React, {useEffect, useState} from 'react';
import "../App.css"
import api from "../api";
import Sidebar from "../components/Sidebar.jsx";
import Editor from "../components/Editor.jsx";
import GraphView from "../components/GraphView.jsx";

function Home() {
    const [notes, setNotes] = useState([]);
    const [activeNoteId, setActiveNoteId] = useState(null);
    const [saveStatus, setSaveStatus] = useState("Saved");
    const [isGraphOpen, setIsGraphOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

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

    const onDeleteNote = async (noteId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this note?")
        if (!confirmDelete) return;

        try {
            // delete on server
            await api.delete(`notes/${noteId}/`);
            // delete from state
            setNotes(notes.filter((note) => note.id !== noteId));
            // if note was open => close redactor
            if (activeNoteId === noteId) {
                setActiveNoteId(null);
            }
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    };

    // graph node click handler
    const onNodeClickFromGraph = (noteId) => {
        setIsGraphOpen(false);
        onSelectNote(noteId);
    }

    const onTagClick = (tagName) => {
        const cleanTag = tagName.replace('#', '');
        setSearchTerm(`#${cleanTag}`);
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
                onDeleteNote={onDeleteNote}
                onOpenGraph={() => setIsGraphOpen(true)}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
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
                    onTagClick={onTagClick}
                />
            </div>
            {isGraphOpen && (
                <GraphView
                    onClose={() => setIsGraphOpen(false)}
                    onNodeClick={onNodeClickFromGraph}
                />
            )}
        </div>
    );
}

export default Home;