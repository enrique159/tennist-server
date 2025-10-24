import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { generateUsername } from '@/shared/utils/generateUsername';
import { UpdateExperienceUserDto } from './dto/update-experience-user.dto';
import { extractFilenameFromUrl } from '@/shared/utils/extractFilenameFromUrl';
import { FilesService } from '@/files/files.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly filesService: FilesService,
  ) {}

  getAllUsers() {
    return this.userRepository.find();
  }

  /**
   * @description Busca un usuario en la base de datos
   * @param { string } id - ID del usuario
   * @returns { Promise<User> } Usuario encontrado
   */
  async findOne(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  /* FIND USER BY EMAIL */
  // Busca un usuario en la base de datos, utilizado para verificar si un usuario existe con un correo electrónico
  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  /* FIND USER BY PHONE NUMBER */
  // Busca un usuario en la base de datos, utilizado para verificar si un usuario existe con un teléfono
  async findByPhoneNumber(phoneNumber: string): Promise<User> {
    return this.userRepository.findOne({ where: { phoneNumber } });
  }

  /* CREATE USER */
  // Crea un nuevo usuario en la base de datos cuando el usuario se registre en la aplicación
  async createUser(user: CreateUserDto): Promise<User> {
    const { email, password, phoneNumber, fullName } = user;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const firstName = fullName.split(' ')[0];

    const newUser = this.userRepository.create({
      username: generateUsername(firstName),
      email,
      password: hashedPassword,
      phoneNumber,
      fullName,
    });

    return this.userRepository.save(newUser);
  }

  /* UPDATE USER EXPERIENCE */
  // Actualiza la experiencia del usuario cuando el usuario actualiza sus datos en la aplicación
  async updateUserExperience(
    user: Partial<UpdateExperienceUserDto>,
    id: string,
  ): Promise<User> {
    await this.userRepository.update(id, user);
    return this.userRepository.findOne({ where: { id } });
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

    await this.userRepository.update(id, updatedUser);
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * @description Sube una imagen para el usuario y actualiza el campo profileImageUrl
   * @param { string } id - ID del usuario
   * @param { Express.Multer.File } file - Archivo de imagen
   * @param { Request } req - Objeto de solicitud
   * @returns { Promise<User> }
   */
  async uploadImage(
    id: string,
    file: Express.Multer.File,
    req: any,
  ): Promise<User> {
    const user = await this.findOne(id);

    if (!user) {
      throw new Error('UserNotFound');
    }

    // Verificar que el archivo tenga un nombre
    if (!file || !file.filename) {
      console.error('Error: Archivo no válido o sin nombre', file);
      throw new Error('ArchivoInvalido');
    }

    // Eliminar la imagen anterior si existe
    if (user.profileImageUrl) {
      const oldFilename = extractFilenameFromUrl(user.profileImageUrl);
      if (oldFilename) {
        try {
          this.filesService.deleteFile(oldFilename);
        } catch (error) {
          // Si hay error al eliminar, lanzamos el error
          throw new Error(`Error al eliminar imagen anterior: ${error}`);
        }
      }
    }

    // Generar URL del archivo
    const imageUrl = this.filesService.getFileUrl(file.filename, req);

    // Actualizar el producto con la nueva imagen
    this.userRepository.update(id, { profileImageUrl: imageUrl });
    return this.userRepository.findOne({ where: { id } });
  }
}
