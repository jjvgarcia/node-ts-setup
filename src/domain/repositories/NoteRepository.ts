import { PaginationOptions, PaginatedResult } from './UserRepository';

export interface NoteEntity {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteEntity {
  title: string;
  content: string;
  userId: string;
}

export interface UpdateNoteEntity {
  title?: string;
  content?: string;
}

export interface NoteRepository {
  findAll(options: PaginationOptions, userId?: string): Promise<PaginatedResult<NoteEntity>>;
  findById(id: string): Promise<NoteEntity | null>;
  findByUserId(userId: string, options: PaginationOptions): Promise<PaginatedResult<NoteEntity>>;
  create(noteData: CreateNoteEntity): Promise<NoteEntity>;
  update(id: string, noteData: UpdateNoteEntity): Promise<NoteEntity | null>;
  delete(id: string): Promise<boolean>;
}
