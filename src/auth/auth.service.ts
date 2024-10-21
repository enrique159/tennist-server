import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@/users/schemas/user.schema';

const TIME_LOCKED = 30 * 1000; // 30 segundos

@Injectable()
export class AuthService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email });
  }

  async addLoginAttempt(email: string): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { email },
      { $inc: { loginAttempts: 1 } },
      { new: true, upsert: true },
    );
  }

  async resetLoginAttempts(email: string): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { email },
      { $set: { loginAttempts: 0 } },
      { new: true, upsert: true },
    );
  }

  async addLastLoginAndResetLoginAttempts(email: string): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { email },
      { $set: { lastLoginAt: new Date(), loginAttempts: 0 } },
      { new: true, upsert: true },
    );
  }

  async lockAccount(email: string): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { email },
      { $set: { lockUntil: new Date(Date.now() + TIME_LOCKED) } },
      { new: true, upsert: true },
    );
  }

  async unlockAccount(email: string): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { email },
      { $set: { lockUntil: null } },
      { new: true, upsert: true },
    );
  }
}
