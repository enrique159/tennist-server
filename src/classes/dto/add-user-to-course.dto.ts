import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class AddUserToCourseDto {
  @IsUUID('4', { message: 'userId debe ser un UUID válido' })
  userId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'reviewNotes no puede superar 500 caracteres' })
  reviewNotes?: string;
}
