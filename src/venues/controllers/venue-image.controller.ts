import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { VenueImageService } from '../services/venue-image.service';
import { UpdateImageOrderDto } from '../dto/update-image-order.dto';
import { VenueImage } from '../entities/venue-image.entity';
import { AuthGuard } from '@/auth/auth.guard';

@Controller('venues')
@UseGuards(AuthGuard)
export class VenueImageController {
  constructor(private readonly venueImageService: VenueImageService) {}

  @Post(':venueId/images')
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
            new BadRequestException('Tipo de archivo no permitido. Solo se aceptan: jpg, jpeg, png, webp'),
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
    @Param('venueId') venueId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ): Promise<VenueImage> {
    if (!file) {
      throw new BadRequestException('No se proporcionó un archivo');
    }
    return this.venueImageService.uploadImage(venueId, file, req, req.user);
  }

  @Get(':venueId/images')
  async getImages(@Param('venueId') venueId: string): Promise<VenueImage[]> {
    return this.venueImageService.findByVenueId(venueId);
  }

  @Delete('images/:imageId')
  async deleteImage(@Param('imageId') imageId: string, @Request() req): Promise<void> {
    return this.venueImageService.deleteImage(imageId, req.user);
  }

  @Put('images/:imageId/order')
  async updateOrder(
    @Param('imageId') imageId: string,
    @Body() updateOrderDto: UpdateImageOrderDto,
    @Request() req,
  ): Promise<VenueImage> {
    return this.venueImageService.updateOrder(imageId, updateOrderDto.displayOrder, req.user);
  }
}
