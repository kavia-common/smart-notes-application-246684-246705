export interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

export interface NotePayload {
  title: string;
  content: string;
  tags: string[];
}
