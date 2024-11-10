import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@/users/schemas/user.schema';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { generateUsername } from '@/shared/utils/generateUsername';
import { MongoErrorCodes } from '@/shared/enums/MongoErrorCodes';

const TIME_LOCKED = 30 * 1000; // 30 segundos

@Injectable()
export class AuthService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async findByEmailOrPhone(emailPhone: string): Promise<User> {
    return this.userModel.findOne({
      $or: [{ email: emailPhone }, { phoneNumber: emailPhone }],
    });
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

  async createUser(user: CreateUserDto): Promise<User> {
    const { email, password, phoneNumber, fullName } = user;

    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      const firstName = fullName.split(' ')[0];

      const newUser = {
        username: generateUsername(firstName),
        email: email.trim(),
        password: hashedPassword,
        phoneNumber: phoneNumber.trim(),
        fullName: fullName.trim().toLowerCase(),
      };

      const response = await this.userModel.create(newUser);
      return response;
    } catch (error) {
      if (error.code === MongoErrorCodes.DUPLICATE_KEY) {
        throw new BadRequestException(
          'Ya existe un usuario con ese correo electrónico o teléfono',
        );
      } else {
        throw new BadRequestException(
          'Ha ocurrido un error al crear el usuario',
        );
      }
    }
  }
}
