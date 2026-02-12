import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VenueImage } from '../entities/venue-image.entity';
import { Venue } from '../venue.entity';
import { FilesService } from '@/files/files.service';
import { Role } from '@/users/domain/user';
import { extractFilenameFromUrl } from '@/shared/utils/extractFilenameFromUrl';

@Injectable()
export class VenueImageService {
  constructor(
    @InjectRepository(VenueImage)
    private venueImageRepository: Repository<VenueImage>,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
    private readonly filesService: FilesService,
  ) {}

  /**
   * @description Sube una imagen para un venue y la registra en la base de datos
   * @param { string } venueId - ID del venue
   * @param { Express.Multer.File } file - Archivo de imagen
   * @param { any } req - Objeto de solicitud HTTP
   * @param { any } currentUser - Usuario actual que realiza la acción
   * @returns { Promise<VenueImage> } Imagen creada
   */
  async uploadImage(
    venueId: string,
    file: Express.Multer.File,
    req: any,
    currentUser: any,
  ): Promise<VenueImage> {
    const venue = await this.venueRepository.findOne({ where: { id: venueId } });

    if (!venue) {
      throw new NotFoundException(`Venue con ID ${venueId} no encontrado`);
    }

    if (currentUser.role !== Role.ADMIN && venue.ownerUserId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para agregar imágenes a este venue');
    }

    if (!file || !file.filename) {
      throw new BadRequestException('No se proporcionó un archivo válido');
    }

    const imageUrl = this.filesService.getFileUrl(file.filename, req);

    // Obtener el siguiente orden
    const lastImage = await this.venueImageRepository.findOne({
      where: { venueId },
      order: { displayOrder: 'DESC' },
    });
    const nextOrder = lastImage ? lastImage.displayOrder + 1 : 0;

    const venueImage = this.venueImageRepository.create({
      imageUrl,
      displayOrder: nextOrder,
      venueId,
    });

    return await this.venueImageRepository.save(venueImage);
  }

  /**
   * @description Obtiene todas las imágenes de un venue ordenadas por displayOrder
   * @param { string } venueId - ID del venue
   * @returns { Promise<VenueImage[]> } Lista de imágenes del venue
   */
  async findByVenueId(venueId: string): Promise<VenueImage[]> {
    const venue = await this.venueRepository.findOne({ where: { id: venueId } });

    if (!venue) {
      throw new NotFoundException(`Venue con ID ${venueId} no encontrado`);
    }

    return await this.venueImageRepository.find({
      where: { venueId },
      order: { displayOrder: 'ASC' },
    });
  }

  /**
   * @description Elimina una imagen de un venue y su archivo del sistema
   * @param { string } imageId - ID de la imagen
   * @param { any } currentUser - Usuario actual que realiza la acción
   * @returns { Promise<void> }
   */
  async deleteImage(imageId: string, currentUser: any): Promise<void> {
    const image = await this.venueImageRepository.findOne({
      where: { id: imageId },
      relations: ['venue'],
    });

    if (!image) {
      throw new NotFoundException(`Imagen con ID ${imageId} no encontrada`);
    }

    if (currentUser.role !== Role.ADMIN && image.venue.ownerUserId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para eliminar esta imagen');
    }

    // Eliminar archivo físico
    const filename = extractFilenameFromUrl(image.imageUrl);
    if (filename) {
      try {
        this.filesService.deleteFile(filename);
      } catch (error) {
        // Si el archivo no existe, continuar con la eliminación del registro
      }
    }

    await this.venueImageRepository.remove(image);
  }

  /**
   * @description Actualiza el orden de una imagen
   * @param { string } imageId - ID de la imagen
   * @param { number } newOrder - Nuevo orden de la imagen
   * @param { any } currentUser - Usuario actual que realiza la acción
   * @returns { Promise<VenueImage> } Imagen actualizada
   */
  async updateOrder(imageId: string, newOrder: number, currentUser: any): Promise<VenueImage> {
    const image = await this.venueImageRepository.findOne({
      where: { id: imageId },
      relations: ['venue'],
    });

    if (!image) {
      throw new NotFoundException(`Imagen con ID ${imageId} no encontrada`);
    }

    if (currentUser.role !== Role.ADMIN && image.venue.ownerUserId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para modificar esta imagen');
    }

    image.displayOrder = newOrder;
    return await this.venueImageRepository.save(image);
  }
}
