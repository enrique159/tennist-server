import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {
  private readonly uploadPath = './uploads';

  constructor(
    private readonly configService: ConfigService,
  ) {}

  /**
   * Obtiene la ruta completa de un archivo
   * @param filename Nombre del archivo
   * @returns Ruta completa del archivo
   */
  getFilePath(filename: string): string {
    const path = join(process.cwd(), this.uploadPath, filename);
    
    if (!existsSync(path)) {
      throw new NotFoundException(`El archivo ${filename} no existe`);
    }
    
    return path;
  }

  /**
   * Elimina un archivo del sistema
   * @param filename Nombre del archivo a eliminar
   * @returns true si se eliminó correctamente
   */
  deleteFile(filename: string): boolean {
    try {
      const path = this.getFilePath(filename);
      unlinkSync(path);
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return false;
    }
  }

  /**
   * Genera la URL para acceder al archivo
   * @param filename Nombre del archivo
   * @returns URL para acceder al archivo
   */
  getFileUrl(filename: string, req: any): string {
    const host = this.configService.get('fileHost') || req.get('host');
    const protocol = this.configService.get('fileProtocol') || req.protocol;
    return `${protocol}://${host}/files/${filename}`;
  }
}