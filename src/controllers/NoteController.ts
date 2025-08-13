import { Response } from 'express';
import { BaseController } from './BaseController';
import { CustomRequest } from '../types';
import { AppError } from '../middlewares';
import { PrismaNoteRepository } from '../infrastructure/database/NoteRepository';
import { PrismaUserRepository } from '../infrastructure/database/UserRepository';

export class NoteController extends BaseController {
  private noteRepository: PrismaNoteRepository;
  private userRepository: PrismaUserRepository;

  constructor() {
    super();
    this.noteRepository = new PrismaNoteRepository();
    this.userRepository = new PrismaUserRepository();
  }

  /**
   * Get all notes with pagination
   */
  public getNotes = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { page, limit, sortBy, sortOrder } = this.getPaginationParams(req);
      const userId = req.query.userId as string;
      
      const result = await this.noteRepository.findAll(
        { page, limit, sortBy, sortOrder },
        userId
      );

      this.sendSuccess(res, result, 'Notes retrieved successfully');
    } catch (error) {
      throw new AppError('Failed to retrieve notes', 500);
    }
  };

  /**
   * Get note by ID
   */
  public getNoteById = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const note = await this.noteRepository.findById(id);
      
      if (!note) {
        return this.sendNotFound(res, 'Note not found');
      }

      this.sendSuccess(res, note, 'Note retrieved successfully');
    } catch (error) {
      throw new AppError('Failed to retrieve note', 500);
    }
  };

  /**
   * Get notes by user ID
   */
  public getNotesByUserId = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { page, limit, sortBy, sortOrder } = this.getPaginationParams(req);
      
      // Check if user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return this.sendNotFound(res, 'User not found');
      }
      
      const result = await this.noteRepository.findByUserId(userId, {
        page,
        limit,
        sortBy,
        sortOrder,
      });

      this.sendSuccess(res, result, 'User notes retrieved successfully');
    } catch (error) {
      throw new AppError('Failed to retrieve user notes', 500);
    }
  };

  /**
   * Create new note
   */
  public createNote = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { title, content, userId } = req.body;

      // Check if user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return this.sendNotFound(res, 'User not found');
      }

      // Create new note
      const newNote = await this.noteRepository.create({
        title,
        content,
        userId,
      });
      
      this.sendCreated(res, newNote, 'Note created successfully');
    } catch (error) {
      throw new AppError('Failed to create note', 500);
    }
  };

  /**
   * Update note
   */
  public updateNote = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      
      const updatedNote = await this.noteRepository.update(id, {
        title,
        content,
      });
      
      if (!updatedNote) {
        return this.sendNotFound(res, 'Note not found');
      }

      this.sendSuccess(res, updatedNote, 'Note updated successfully');
    } catch (error) {
      throw new AppError('Failed to update note', 500);
    }
  };

  /**
   * Delete note
   */
  public deleteNote = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const deleted = await this.noteRepository.delete(id);
      
      if (!deleted) {
        return this.sendNotFound(res, 'Note not found');
      }
      
      this.sendNoContent(res);
    } catch (error) {
      throw new AppError('Failed to delete note', 500);
    }
  };
}
