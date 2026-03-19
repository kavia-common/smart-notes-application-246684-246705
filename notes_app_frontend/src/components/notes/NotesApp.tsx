"use client";

import { useEffect, useMemo, useState } from "react";
import NoteForm from "@/components/notes/NoteForm";
import NotesList from "@/components/notes/NotesList";
import { createNote, deleteNote, fetchNotes, updateNote } from "@/lib/api/notes";
import type { Note, NotePayload } from "@/types/note";

type EditorMode = "create" | "edit";

// PUBLIC_INTERFACE
export default function NotesApp() {
  /** Root interactive notes experience: load/search/list notes and create/edit/delete operations. */
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>("create");

  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedNoteId = useMemo(() => selectedNote?.id ?? null, [selectedNote]);

  const loadNotes = async (search?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchNotes(search);
      setNotes(data);

      if (selectedNote) {
        const refreshedSelected = data.find((note) => note.id === selectedNote.id);
        setSelectedNote(refreshedSelected ?? null);
        if (!refreshedSelected && editorMode === "edit") {
          setEditorMode("create");
        }
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load notes. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchInput.trim();
    setActiveSearch(query);
    await loadNotes(query || undefined);
  };

  const handleSearchReset = async () => {
    setSearchInput("");
    setActiveSearch("");
    await loadNotes();
  };

  const handleCreate = async (payload: NotePayload) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const created = await createNote(payload);
      setSuccessMessage("Note created successfully.");
      setEditorMode("edit");
      setSelectedNote(created);
      await loadNotes(activeSearch || undefined);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create note. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (payload: NotePayload) => {
    if (!selectedNote) {
      setErrorMessage("Please select a note to edit.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updated = await updateNote(selectedNote.id, payload);
      setSuccessMessage("Note updated successfully.");
      setSelectedNote(updated);
      await loadNotes(activeSearch || undefined);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update note. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (note: Note) => {
    const confirmed = window.confirm(`Delete "${note.title}"? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await deleteNote(note.id);
      setSuccessMessage("Note deleted successfully.");

      if (selectedNote?.id === note.id) {
        setSelectedNote(null);
        setEditorMode("create");
      }

      await loadNotes(activeSearch || undefined);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete note. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setEditorMode("edit");
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleCreateNewClick = () => {
    setSelectedNote(null);
    setEditorMode("create");
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  return (
    <main className="notes-page">
      <header className="app-header">
        <div>
          <h1 className="app-title">Smart Notes</h1>
          <p className="app-subtitle">Capture ideas, organize with tags, and find notes quickly.</p>
        </div>
        <button type="button" className="button button-primary" onClick={handleCreateNewClick}>
          New Note
        </button>
      </header>

      <section className="notes-toolbar" aria-label="Search notes">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <label htmlFor="search-notes" className="sr-only">
            Search notes
          </label>
          <input
            id="search-notes"
            className="input"
            type="search"
            placeholder="Search by title, content, or tags..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <button type="submit" className="button button-secondary">
            Search
          </button>
          <button type="button" className="button button-ghost" onClick={handleSearchReset}>
            Clear
          </button>
        </form>
      </section>

      {errorMessage ? (
        <p role="alert" className="status-message status-error">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? <p className="status-message status-success">{successMessage}</p> : null}

      <div className="notes-grid">
        <NotesList
          notes={notes}
          selectedNoteId={selectedNoteId}
          isLoading={isLoading}
          isDeleting={isDeleting}
          activeSearch={activeSearch}
          onSelect={handleSelectNote}
          onDelete={handleDelete}
        />

        <NoteForm
          mode={editorMode}
          initialNote={selectedNote}
          isSubmitting={isSubmitting}
          onSubmit={editorMode === "create" ? handleCreate : handleUpdate}
          onCancel={editorMode === "edit" ? handleCreateNewClick : undefined}
        />
      </div>
    </main>
  );
}
