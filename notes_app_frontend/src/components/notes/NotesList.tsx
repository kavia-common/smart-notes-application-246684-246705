"use client";

import type { Note } from "@/types/note";

interface NotesListProps {
  notes: Note[];
  selectedNoteId: number | null;
  isLoading: boolean;
  isDeleting: boolean;
  activeSearch: string;
  onSelect: (note: Note) => void;
  onDelete: (note: Note) => Promise<void>;
}

function formatDate(isoDate?: string): string {
  if (!isoDate) {
    return "No date";
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return date.toLocaleString();
}

// PUBLIC_INTERFACE
export default function NotesList({
  notes,
  selectedNoteId,
  isLoading,
  isDeleting,
  activeSearch,
  onSelect,
  onDelete,
}: NotesListProps) {
  /** Renders notes list panel with loading, empty states, selection and delete actions. */
  return (
    <section className="notes-card notes-list-card" aria-labelledby="notes-list-heading">
      <div className="list-header">
        <h2 id="notes-list-heading" className="section-title">
          Notes
        </h2>
        <span className="notes-count">{notes.length}</span>
      </div>

      {isLoading ? (
        <p className="status-message">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="status-message">
          {activeSearch
            ? `No notes matched "${activeSearch}".`
            : "No notes yet. Create your first note to get started."}
        </p>
      ) : (
        <ul className="notes-list" aria-live="polite">
          {notes.map((note) => {
            const isSelected = selectedNoteId === note.id;
            return (
              <li key={note.id} className={`note-item ${isSelected ? "note-item-active" : ""}`}>
                <button
                  type="button"
                  className="note-select-button"
                  onClick={() => onSelect(note)}
                  aria-pressed={isSelected}
                >
                  <div className="note-item-header">
                    <h3 className="note-item-title">{note.title}</h3>
                    <span className="note-item-date">{formatDate(note.updated_at || note.created_at)}</span>
                  </div>
                  <p className="note-item-content">{note.content}</p>
                  {note.tags.length > 0 ? (
                    <div className="tags-row">
                      {note.tags.map((tag) => (
                        <span key={`${note.id}-${tag}`} className="tag-pill">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </button>
                <button
                  type="button"
                  className="button button-danger note-delete-button"
                  onClick={() => onDelete(note)}
                  disabled={isDeleting}
                  aria-label={`Delete note: ${note.title}`}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
