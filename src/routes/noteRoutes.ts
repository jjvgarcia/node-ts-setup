import { Router } from 'express';
import { NoteController } from '@controllers/NoteController';
import { validate, sanitizeBody } from '../middlewares';
import {
  CreateNoteSchema,
  UpdateNoteSchema,
  NoteParamsSchema,
  UserNoteParamsSchema,
  NoteQuerySchema,
} from '../presentation/validators/note.schemas';

const router = Router();
const noteController = new NoteController();

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Note management endpoints
 */

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Get all notes
 *     tags: [Notes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter notes by user ID
 *     responses:
 *       200:
 *         description: Notes retrieved successfully
 */
router.get(
  '/',
  validate({ query: NoteQuerySchema }),
  noteController.getNotes
);

/**
 * @swagger
 * /notes/{id}:
 *   get:
 *     summary: Get note by ID
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Note retrieved successfully
 *       404:
 *         description: Note not found
 */
router.get(
  '/:id',
  validate({ params: NoteParamsSchema }),
  noteController.getNoteById
);

/**
 * @swagger
 * /notes:
 *   post:
 *     summary: Create a new note
 *     tags: [Notes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - userId
 *             properties:
 *               title:
 *                 type: string
 *                 description: Note title
 *               content:
 *                 type: string
 *                 description: Note content
 *               userId:
 *                 type: string
 *                 description: ID of the user creating the note
 *     responses:
 *       201:
 *         description: Note created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 */
router.post(
  '/',
  sanitizeBody,
  validate({ body: CreateNoteSchema }),
  noteController.createNote
);

/**
 * @swagger
 * /notes/{id}:
 *   put:
 *     summary: Update a note
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Note title
 *               content:
 *                 type: string
 *                 description: Note content
 *     responses:
 *       200:
 *         description: Note updated successfully
 *       404:
 *         description: Note not found
 */
router.put(
  '/:id',
  sanitizeBody,
  validate({ params: NoteParamsSchema, body: UpdateNoteSchema }),
  noteController.updateNote
);

/**
 * @swagger
 * /notes/{id}:
 *   delete:
 *     summary: Delete a note
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     responses:
 *       204:
 *         description: Note deleted successfully
 *       404:
 *         description: Note not found
 */
router.delete(
  '/:id',
  validate({ params: NoteParamsSchema }),
  noteController.deleteNote
);

/**
 * @swagger
 * /users/{userId}/notes:
 *   get:
 *     summary: Get notes by user ID
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: User notes retrieved successfully
 *       404:
 *         description: User not found
 */
router.get(
  '/users/:userId/notes',
  validate({ params: UserNoteParamsSchema, query: NoteQuerySchema }),
  noteController.getNotesByUserId
);

export default router;
