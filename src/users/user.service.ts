import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  getAllUsers() {
    return this.userModel.find();
  }

  createUser() {
    return this.userModel.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password',
    });
  }
}
