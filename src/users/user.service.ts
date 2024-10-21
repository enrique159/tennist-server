import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { generateUsername } from '@/shared/utils/generateUsername';

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

  /* CREATE USER */
  // Crea un nuevo usuario en la base de datos cuando el usuario se registre en la aplicación
  async createUser(user: CreateUserDto): Promise<User> {
    const { email, password, phoneNumber, fullName, role } = user;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      username: generateUsername(email),
      email,
      password: hashedPassword,
      phoneNumber,
      fullName,
      role,
    };

    return this.userModel.create(newUser);
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
