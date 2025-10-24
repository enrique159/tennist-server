import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
  ParseFilePipeBuilder,
  Req,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { type Response, type Request } from 'express';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/auth/auth.guard';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 }) // 5MB máximo
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return {
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      url: this.filesService.getFileUrl(file.filename, req),
    };
  }

  @Get(':filename')
  @UseGuards(AuthGuard)
  getFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const path = this.filesService.getFilePath(filename);
      return res.sendFile(path);
    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'Archivo no encontrado',
      });
    }
  }

  @Delete(':filename')
  @UseGuards(AuthGuard)
  deleteFile(@Param('filename') filename: string) {
    const deleted = this.filesService.deleteFile(filename);
    return {
      deleted,
      filename,
    };
  }
}