import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@/auth/auth.guard';
import { UpdateExperienceUserDto } from './dto/update-experience-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsService } from '@/shared/services/aws.services';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly awsService: AwsService,
  ) {}

  /* GET ALL USERS */
  // Obtiene todos los usuarios registrados en la base de datos; Solo disponible para Administradores
  @UseGuards(AuthGuard)
  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  /* CREATE USER */
  // Crea un nuevo usuario en la base de datos, se registran por medio de la app
  @Post()
  createUser(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
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
    return this.userService.updateUserExperience(updateUserExperienceDto, id);
  }

  /* UPLOAD PROFILE IMAGE */
  // Carga una imagen de perfil del usuario, esto ocurre una vez que el usuario se registra por medio de la app
  @UseGuards(AuthGuard)
  @Post('profile-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: any },
  ) {
    const userToken = req.user;
    let user;
    this.userService
      .findByEmail(userToken.email)
      .then((response) => {
        user = response;
      })
      .catch((error) => {
        console.log(error);
        throw new NotFoundException('User not found');
      });

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const mimetype = file.originalname.split('.').pop();
    const key = `tennist/users/${user._id}/profile-image.${mimetype}`;
    const response = await this.awsService.uploadFile(key, file);
    if (!response || response.$metadata.httpStatusCode !== HttpStatus.OK) {
      throw new InternalServerErrorException('Error uploading file');
    }

    return { success: true };
  }

  /* UPDATE USER */
  // Actualiza datos del usuario como nombre, correo, username, teléfono, etc.
  @UseGuards(AuthGuard)
  @Put(':id')
  updateUser(
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
    @Param('id') id: string,
  ) {
    return this.userService.updateUser(updateUserDto, id);
  }
}
