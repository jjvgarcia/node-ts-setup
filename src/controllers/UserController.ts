import { Response } from 'express';
import { BaseController } from './BaseController';
import { CustomRequest } from '../types';
import { AppError } from '../middlewares';
import { CreateUserInput, UpdateUserInput, UserParams } from '../presentation/validators/user.schemas';
import { PrismaUserRepository } from '../infrastructure/database/UserRepository';

export class UserController extends BaseController {
  private userRepository: PrismaUserRepository;

  constructor() {
    super();
    this.userRepository = new PrismaUserRepository();
  }
  /**
   * Get all users with pagination
   */
  public getUsers = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { page, limit, sortBy, sortOrder } = this.getPaginationParams(req);
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;

      const result = await this.userRepository.findAll(
        { page, limit, sortBy, sortOrder },
        search
      );

      this.sendSuccess(res, result, 'Users retrieved successfully');
    } catch (error) {
      throw new AppError('Failed to retrieve users', 500);
    }
  };

  /**
   * Get user by ID
   */
  public getUserById = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params as UserParams;

      const user = await this.userRepository.findById(id);

      if (!user) {
        return this.sendNotFound(res, 'User not found');
      }

      this.sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
      throw new AppError('Failed to retrieve user', 500);
    }
  };

  /**
   * Create new user
   */
  public createUser = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const userData = req.body as CreateUserInput;

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        return this.sendError(res, 'User with this email already exists', 409);
      }

      // Create new user
      const newUser = await this.userRepository.create({
        email: userData.email,
        name: userData.name,
        password: userData.password, // In real app, this would be hashed
      });

      this.sendCreated(res, newUser, 'User created successfully');
    } catch (error) {
      throw new AppError('Failed to create user', 500);
    }
  };

  /**
   * Update user
   */
  public updateUser = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params as UserParams;
      const updateData = req.body as UpdateUserInput;

      // Check if user exists
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        return this.sendNotFound(res, 'User not found');
      }

      // Check if email is being updated and already exists
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await this.userRepository.exists(updateData.email);
        if (emailExists) {
          return this.sendError(res, 'User with this email already exists', 409);
        }
      }

      // Update user
      const updatedUser = await this.userRepository.update(id, updateData);

      if (!updatedUser) {
        return this.sendNotFound(res, 'User not found');
      }

      this.sendSuccess(res, updatedUser, 'User updated successfully');
    } catch (error) {
      throw new AppError('Failed to update user', 500);
    }
  };

  /**
   * Delete user
   */
  public deleteUser = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params as UserParams;

      const deleted = await this.userRepository.delete(id);

      if (!deleted) {
        return this.sendNotFound(res, 'User not found');
      }

      this.sendNoContent(res);
    } catch (error) {
      throw new AppError('Failed to delete user', 500);
    }
  };
}
