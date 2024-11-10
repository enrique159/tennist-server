import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { generateUsername } from '@/shared/utils/generateUsername';
import { UpdateExperienceUserDto } from './dto/update-experience-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  getAllUsers() {
    return this.userModel.find();
  }

  /* FIND USER BY EMAIL */
  // Busca un usuario en la base de datos, utilizado para verificar si un usuario existe con un correo electrónico
  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email });
  }

  /* FIND USER BY PHONE NUMBER */
  // Busca un usuario en la base de datos, utilizado para verificar si un usuario existe con un teléfono
  async findByPhoneNumber(phoneNumber: string): Promise<User> {
    return this.userModel.findOne({ phoneNumber });
  }

  /* CREATE USER */
  // Crea un nuevo usuario en la base de datos cuando el usuario se registre en la aplicación
  async createUser(user: CreateUserDto): Promise<User> {
    const { email, password, phoneNumber, fullName } = user;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const firstName = fullName.split(' ')[0];

    const newUser = {
      username: generateUsername(firstName),
      email,
      password: hashedPassword,
      phoneNumber,
      fullName,
    };

    return this.userModel.create(newUser);
  }

  /* UPDATE USER EXPERIENCE */
  // Actualiza la experiencia del usuario cuando el usuario actualiza sus datos en la aplicación
  async updateUserExperience(
    user: Partial<UpdateExperienceUserDto>,
    id: string,
  ): Promise<User> {
    const updatedUser = { ...user };
    return this.userModel.findByIdAndUpdate(id, updatedUser);
  }

  /* UPDATE USER */
  // Actualiza un usuario cuando el usuario actualiza sus datos en la aplicación
  async updateUser(user: Partial<UpdateUserDto>, id: string): Promise<User> {
    const updatedUser = { ...user };
    if (user.password) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(user.password, salt);
      updatedUser.password = hashedPassword;
    }

    return this.userModel.findByIdAndUpdate(id, updatedUser);
  }
}
