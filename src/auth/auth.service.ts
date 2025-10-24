import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/users/user.entity';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { generateUsername } from '@/shared/utils/generateUsername';

const TIME_LOCKED = 30 * 1000; // 30 segundos

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmailOrPhone(emailPhone: string): Promise<User> {
    return this.userRepository.findOne({
      where: [
        { email: emailPhone },
        { phoneNumber: emailPhone },
      ],
    });
  }

  async addLoginAttempt(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      user.loginAttempts += 1;
      return this.userRepository.save(user);
    }
    return null;
  }

  async resetLoginAttempts(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      user.loginAttempts = 0;
      return this.userRepository.save(user);
    }
    return null;
  }

  async addLastLoginAndResetLoginAttempts(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      user.lastLoginAt = new Date();
      user.loginAttempts = 0;
      return this.userRepository.save(user);
    }
    return null;
  }

  async lockAccount(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      user.lockUntil = new Date(Date.now() + TIME_LOCKED);
      return this.userRepository.save(user);
    }
    return null;
  }

  async unlockAccount(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      user.lockUntil = null;
      return this.userRepository.save(user);
    }
    return null;
  }

  async createUser(user: CreateUserDto): Promise<User> {
    const { email, password, phoneNumber, fullName } = user;

    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      const firstName = fullName.split(' ')[0];

      const newUser = this.userRepository.create({
        username: generateUsername(firstName),
        email: email.trim(),
        password: hashedPassword,
        phoneNumber: phoneNumber.trim(),
        fullName: fullName.trim().toLowerCase(),
      });

      const response = await this.userRepository.save(newUser);
      return response;
    } catch (error) {
      if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
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
