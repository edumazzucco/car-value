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
    mockUsersService = {
      find: () => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
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

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with salted and hashed password', async () => {
    const user = await service.signup('email@email.com', 'testPW');

    expect(user.password).not.toEqual('testPw');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    mockUsersService.find = () =>
      Promise.resolve([{ id: 1, email: 'a@a.com', password: '1' } as User]);
    await expect(service.signup('a@a.com', '1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws an error if there is no user with the given email', async () => {
    await expect(
      service.signin('nonuseremail@email.com', 'pass'),
    ).rejects.toThrow(NotFoundException);
  });
});
