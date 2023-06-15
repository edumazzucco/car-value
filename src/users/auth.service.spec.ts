import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Mock users service
    const users: User[] = [];
    mockUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 9999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('should be able to create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('should create a new user with salted and hashed password', async () => {
    const user = await service.signup('email@email.com', 'testPW');

    expect(user.password).not.toEqual('testPw');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('should throw an error if user signs up with email that is in use', async () => {
    await service.signup('a@a.com', '1');
    await expect(service.signup('a@a.com', '1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw an error if there is no user with the given email', async () => {
    await expect(
      service.signin('nonuseremail@email.com', 'pass'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw an error if an invalid password is provided', async () => {
    await service.signup('test@test.com', 'correctPW');
    await expect(service.signin('test@test.com', 'wrongPW')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should return a user if correct password is provided', async () => {
    await service.signup('correct@email.com', 'correctPW');
    const user = await service.signin('correct@email.com', 'correctPW');
    expect(user).toBeDefined();
  });
});
