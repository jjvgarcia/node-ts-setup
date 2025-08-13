import { Response } from 'express';
import { BaseController } from './BaseController';
import { CustomRequest, User, CreateUserDto, UpdateUserDto } from '../types';
import { AppError } from '../middlewares';

// Mock data for demonstration (replace with actual database operations)
let users: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'user',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
];

export class UserController extends BaseController {
  /**
   * Get all users with pagination
   */
  public getUsers = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { page, limit, offset } = this.getPaginationParams(req);
      
      // Simulate database query with pagination
      const total = users.length;
      const paginatedUsers = users.slice(offset, offset + limit);
      
      const response = {
        data: paginatedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: offset + limit < total,
          hasPrev: page > 1,
        },
      };

      this.sendSuccess(res, response, 'Users retrieved successfully');
    } catch (error) {
      throw new AppError('Failed to retrieve users', 500);
    }
  };

  /**
   * Get user by ID
   */
  public getUserById = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const user = users.find(u => u.id === id);
      
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
      const userData: CreateUserDto = req.body;
      
      // Basic validation
      if (!userData.email || !userData.name || !userData.password) {
        return this.sendBadRequest(res, 'Email, name, and password are required');
      }

      // Check if user already exists
      const existingUser = users.find(u => u.email === userData.email);
      if (existingUser) {
        return this.sendError(res, 'User with this email already exists', 409);
      }

      // Create new user
      const newUser: User = {
        id: (users.length + 1).toString(),
        email: userData.email,
        name: userData.name,
        role: userData.role || 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      users.push(newUser);

      // Remove password from response
      const { ...userResponse } = newUser;
      
      this.sendCreated(res, userResponse, 'User created successfully');
    } catch (error) {
      throw new AppError('Failed to create user', 500);
    }
  };

  /**
   * Update user
   */
  public updateUser = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateUserDto = req.body;
      
      const userIndex = users.findIndex(u => u.id === id);
      
      if (userIndex === -1) {
        return this.sendNotFound(res, 'User not found');
      }

      // Update user
      users[userIndex] = {
        ...users[userIndex],
        ...updateData,
        updatedAt: new Date(),
      };

      this.sendSuccess(res, users[userIndex], 'User updated successfully');
    } catch (error) {
      throw new AppError('Failed to update user', 500);
    }
  };

  /**
   * Delete user
   */
  public deleteUser = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const userIndex = users.findIndex(u => u.id === id);
      
      if (userIndex === -1) {
        return this.sendNotFound(res, 'User not found');
      }

      users.splice(userIndex, 1);
      
      this.sendNoContent(res);
    } catch (error) {
      throw new AppError('Failed to delete user', 500);
    }
  };
}
