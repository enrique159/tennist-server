import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@/auth/auth.guard';
import { UpdateExperienceUserDto } from './dto/update-experience-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsService } from '@/shared/services/aws.services';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserToken } from './domain/user';
import { User } from './user.entity';

@Controller('users')
export class UserController {
  constructor(
    private readonly usersService: UsersService,
    private readonly awsService: AwsService,
  ) {}

  /* GET ALL USERS */
  // Obtiene todos los usuarios registrados en la base de datos; Solo disponible para Administradores
  @UseGuards(AuthGuard)
  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  /* CREATE USER */
  // Crea un nuevo usuario en la base de datos, se registran por medio de la app
  @Post()
  createUser(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  /* UPDATE USER EXPERIENCE */
  // Actualiza datos del usuario como iniciación de su cuenta.
  @UseGuards(AuthGuard)
  @Put(':id/experience')
  @UseInterceptors(FileInterceptor('file'))
  updateUserExperience(
    @Body(new ValidationPipe())
    updateUserExperienceDto: UpdateExperienceUserDto,
    @Param('id') id: string,
  ) {
    return this.usersService.updateUserExperience(updateUserExperienceDto, id);
  }

  /* UPLOAD PROFILE IMAGE */
  // Carga una imagen de perfil del usuario, esto ocurre una vez que el usuario se registra por medio de la app
  @Post('upload-image')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = crypto.randomUUID();
          const extension = extname(file.originalname);
          callback(null, `${uniqueName}${extension}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const validExtensions = /(jpg|jpeg|png|webp)$/;
        const isValid = validExtensions.test(
          extname(file.originalname).toLowerCase(),
        );
        if (!isValid) {
          return callback(
            new BadRequestException('Tipo de archivo no permitido'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: UserToken },
  ): Promise<User> {
    if (!file) {
      throw new BadRequestException('No se proporcionó un archivo');
    }
    const userId = req.user.id;
    try {
      return await this.usersService.uploadImage(userId, file, req);
    } catch (error) {
      console.error('Error en uploadImage:', error);
      if (error?.message === 'UserNotFound') {
        throw new NotFoundException('El usuario no se encontró');
      }
      if (error?.message === 'ArchivoInvalido') {
        throw new BadRequestException('El archivo proporcionado no es válido');
      }
      throw new InternalServerErrorException(
        `Error al subir la imagen: ${error.message}`,
      );
    }
  }

  /* UPDATE USER */
  // Actualiza datos del usuario como nombre, correo, username, teléfono, etc.
  @UseGuards(AuthGuard)
  @Put(':id')
  updateUser(
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
    @Param('id') id: string,
  ) {
    return this.usersService.updateUser(updateUserDto, id);
  }
}
