import React, {useEffect, useState} from 'react';
import "../App.css"
import api from "../api";
import Sidebar from "../components/Sidebar.jsx";
import Editor from "../components/Editor.jsx";
import GraphView from "../components/GraphView.jsx";

function Home() {
    const [notes, setNotes] = useState([]);
    const [folders, setFolders] = useState([]);
    const [activeNoteId, setActiveNoteId] = useState(null);
    const [saveStatus, setSaveStatus] = useState("Saved");
    const [isGraphOpen, setIsGraphOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const notesRes = await api.get('notes/');
                const foldersRes = await api.get('folders/')

                const notesData = notesRes.data.results || notesRes.data;
                const foldersData = foldersRes.data.results || foldersRes.data

                setNotes(notesData);
                setFolders(foldersData);
            } catch (error) {
                console.error(error);
            }
        }
        fetchNotes();
    }, []);

    const onAddFolder = async (parentFolderId = null) => {
        const folderName = window.prompt("Write new folder name:");
        if (!folderName) return;

        try {
            const response = await api.post('folders/', {
                name: folderName,
                parent: parentFolderId
            });
            setFolders([...folders, response.data]);
        } catch (error) {
            console.error("Error creating folder: ", error);
            alert("Error while creating new folder");
        }
    };

    const addNote = async (customTitle = null, folderId = null) => {
        try {
            const response = await api.post('notes/', {
                title: typeof customTitle === 'string' ? customTitle: "NewNote",
                content: "",
                folders: folderId
            });
            const newNote = response.data;
            setNotes([newNote, ...notes]);
            setActiveNoteId(newNote.id);
            return newNote
        } catch (error) {
            console.error("Error creating note:",error);
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

    const getAllChildFolderIds = (folderId) => {
        const directChildren = folders.filter(f => f.parent === folderId);
        let allIds = directChildren.map(f => f.id);
        directChildren.forEach(child => {
            allIds = allIds.concat(getAllChildFolderIds(child.id));
        });
        return allIds;
    };

    const onDeleteFolder = async (folderId) => {
        const allFolderIds = [folderId, ...getAllChildFolderIds(folderId)];
        const containedNotes = notes.filter(n => allFolderIds.includes(n.folders));
        const childFoldersCount = allFolderIds.length - 1;

        let message = `Delete this folder?`;
        if (containedNotes.length > 0 || childFoldersCount > 0) {
            message = `This folder contains ${childFoldersCount} subfolder(s) and ${containedNotes.length} note(s).
            Everything will be deleted. Continue?`;
        }

        const confirmed = window.confirm(message);
        if (!confirmed) return;

        try {
            await api.delete(`folders/${folderId}/`);
            setFolders(folders.filter(f => !allFolderIds.includes(f.id)));
            setNotes(notes.filter(n => !allFolderIds.includes(n.folders)));
            if (containedNotes.some(n => n.id === activeNoteId)) {
                setActiveNoteId(null);
            }
        } catch (error) {
            console.error("Error deleting folder:", error);
            alert("Error while deleting folder");
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


    const onWikiLinkClick = async (title) => {
        const targetNote = notes.find(n => n.title.toLowerCase() === title.toLowerCase());

        if (targetNote) {
            onSelectNote(targetNote.id);
        } else {
            const confirmed = window.confirm(`Note "${title}" was not found. Create new?`);
            if (confirmed) {
                await addNote(title);
            }
        }
    };

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
                folders={folders}
                activeNoteId={activeNoteId}
                onSelectNote={onSelectNote}
                onAddNote={addNote}
                onAddFolder={onAddFolder}
                onDeleteNote={onDeleteNote}
                onDeleteFolder={onDeleteFolder}
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
                    onWikiLinkClick={onWikiLinkClick}
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