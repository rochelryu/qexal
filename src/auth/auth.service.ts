import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from '../users/user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(username: string, pass): Promise<any> {
    const user = await this.usersService.verifyUser(username, pass);
    if (user[0]) {
      const { password, ...result } = user[0];
      return result;
    }
    return null;
  }

  async createUser(user: User) {
    // const newUser = await this.usersService.createUser(user);
    // return newUser;
  }
}
