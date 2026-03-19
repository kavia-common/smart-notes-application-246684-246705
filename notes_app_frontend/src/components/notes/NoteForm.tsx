"use client";

import { useEffect, useState } from "react";
import type { Note, NotePayload } from "@/types/note";

interface NoteFormProps {
  mode: "create" | "edit";
  initialNote?: Note | null;
  isSubmitting: boolean;
  onCancel?: () => void;
  onSubmit: (payload: NotePayload) => Promise<void>;
}

// PUBLIC_INTERFACE
export default function NoteForm({
  mode,
  initialNote,
  isSubmitting,
  onCancel,
  onSubmit,
}: NoteFormProps) {
  /** Form component used for creating and editing notes. */
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      setTagsInput(initialNote.tags.join(", "));
    } else {
      setTitle("");
      setContent("");
      setTagsInput("");
    }
    setValidationError(null);
  }, [mode, initialNote]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      setValidationError("Title is required.");
      return;
    }

    if (!content.trim()) {
      setValidationError("Content is required.");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    setValidationError(null);
    await onSubmit({
      title: title.trim(),
      content: content.trim(),
      tags,
    });

    if (mode === "create") {
      setTitle("");
      setContent("");
      setTagsInput("");
    }
  };

  return (
    <section className="notes-card" aria-labelledby={`${mode}-note-heading`}>
      <h2 id={`${mode}-note-heading`} className="section-title">
        {mode === "create" ? "Create Note" : "Edit Note"}
      </h2>

      <form className="note-form" onSubmit={handleSubmit}>
        <label htmlFor="note-title" className="label">
          Title
        </label>
        <input
          id="note-title"
          type="text"
          className="input"
          value={title}
          placeholder="Enter a note title..."
          onChange={(event) => setTitle(event.target.value)}
          disabled={isSubmitting}
          maxLength={120}
        />

        <label htmlFor="note-content" className="label">
          Content
        </label>
        <textarea
          id="note-content"
          className="textarea"
          value={content}
          placeholder="Write your note..."
          onChange={(event) => setContent(event.target.value)}
          disabled={isSubmitting}
          rows={8}
        />

        <label htmlFor="note-tags" className="label">
          Tags (optional)
        </label>
        <input
          id="note-tags"
          type="text"
          className="input"
          value={tagsInput}
          placeholder="work, ideas, personal"
          onChange={(event) => setTagsInput(event.target.value)}
          disabled={isSubmitting}
        />

        {validationError ? (
          <p role="alert" className="status-message status-error">
            {validationError}
          </p>
        ) : null}

        <div className="form-actions">
          {onCancel ? (
            <button
              type="button"
              className="button button-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          ) : null}
          <button type="submit" className="button button-primary" disabled={isSubmitting}>
            {isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
              ? "Create Note"
              : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
