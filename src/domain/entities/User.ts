export interface UserEntity {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserEntity {
  email: string;
  name: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserEntity {
  email?: string;
  name?: string;
  role?: 'admin' | 'user';
}

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: 'admin' | 'user',
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(data: CreateUserEntity): Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      email: data.email,
      name: data.name,
      role: data.role || 'user',
    };
  }

  update(data: UpdateUserEntity): Partial<UserEntity> {
    return {
      ...data,
      updatedAt: new Date(),
    };
  }

  toJSON(): UserEntity {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
