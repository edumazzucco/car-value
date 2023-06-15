import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: Partial<UsersService>;
  let mockAuthService: Partial<AuthService>;

  beforeEach(async () => {
    mockUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'XXXXXXXXXXXXX',
          password: 'XXXX',
        } as User);
      },
      find: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: 'XXXX' } as User]);
      },
      remove(id: number) {
        return Promise.resolve({ id } as User);
      },
      update(id: number, attrs: Partial<User>) {
        return Promise.resolve({ id, ...attrs } as User);
      },
    };
    mockAuthService = {
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
      signup: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('oioi');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('oioi');
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('X');
    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with given id is not found', async () => {
    mockUsersService.findOne = () => null;
    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('signin updates session object and returns user', async () => {
    const session = { userId: 'wrong' };
    const user = await controller.signin(
      { email: 'XXXXX', password: 'XXXX' },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
