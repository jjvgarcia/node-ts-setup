import { UserEntity, CreateUserEntity, UpdateUserEntity } from '../entities/User';

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UserRepository {
  findAll(options: PaginationOptions, search?: string): Promise<PaginatedResult<UserEntity>>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(userData: CreateUserEntity): Promise<UserEntity>;
  update(id: string, userData: UpdateUserEntity): Promise<UserEntity | null>;
  delete(id: string): Promise<boolean>;
  exists(email: string): Promise<boolean>;
}
