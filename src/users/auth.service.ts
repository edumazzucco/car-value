import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // Check if email is already in use
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('Email already in use');
    }

    // Hash the password
    // Generate a salt
    const salt = randomBytes(8).toString('hex');

    // Has the salt and the pw
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // Join the hashed result and the salt
    const result = salt + '.' + hash.toString('hex');

    // Create new user and save it
    const user = await this.usersService.create(email, result);

    // return the user
    return user;
  }
  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash === hash.toString('hex')) {
      return user;
    } else {
      throw new BadRequestException('Invalid credentials');
    }
  }
}
