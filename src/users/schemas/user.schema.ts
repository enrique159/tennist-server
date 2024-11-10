import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  CourtTypePreference,
  Experience,
  PlayerGoals,
  PlayingStyle,
  Role,
  DominantHand,
  GamePreference,
  Gender,
} from '../domain/user';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class User {
  _id?: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ required: true })
  password: string;

  @Prop({ unique: true })
  phoneNumber: string;

  @Prop({ default: false })
  phoneVerified: boolean;

  @Prop({ required: true })
  fullName: string;

  @Prop()
  profileImageUrl: string;

  @Prop({ enum: Role, default: Role.PLAYER })
  role: Role;

  @Prop({ enum: Gender, default: Gender.MALE })
  gender: Gender;

  @Prop({ default: 18 })
  age: number;

  @Prop({ enum: Experience, default: Experience.BEGGINER })
  experience: Experience;

  @Prop({ default: 0 })
  playingTime: number;

  @Prop({ enum: PlayingStyle, default: PlayingStyle.NONE })
  playingStyle: PlayingStyle;

  @Prop({ enum: CourtTypePreference, default: CourtTypePreference.HARD })
  courtTypePreference: CourtTypePreference;

  @Prop({ default: 0 })
  gamesPerWeek: number;

  @Prop({ enum: PlayerGoals, default: PlayerGoals.NONE })
  playerGoals: PlayerGoals;

  @Prop({ enum: DominantHand, default: DominantHand.RIGHT })
  dominantHand: DominantHand;

  @Prop({ enum: GamePreference, default: GamePreference.SINGLES })
  gamePreference: GamePreference;

  @Prop({ default: 'active' })
  status: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: Date.now })
  lastLoginAt: Date;

  @Prop()
  activationCode: string;

  @Prop()
  resetPasswordToken: string;

  @Prop()
  resetPasswordExpires: Date;

  @Prop({ default: false })
  twoFactorEnabled: boolean;

  @Prop({ default: 0 })
  loginAttempts: number;

  @Prop()
  lockUntil: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

/*
{
  "_id": ObjectId("5f5c5b5e5f5c5b5e5f5c5b5e"), // ID único del usuario
  "username": "nombreDeUsuario",              // Nombre de usuario o identificador único
  "email": "usuario@correo.com",              // Correo electrónico
  "emailVerified": false,                     // Si el correo ha sido verificado
  "passwordHash": "hashedPassword",           // Hash de la contraseña (no se guarda la contraseña en texto plano)
  "phoneNumber": "+123456789",                // Número de teléfono
  "phoneVerified": false,                     // Si el teléfono ha sido verificado
  "fullName": "Nombre Completo",              // Nombre completo del usuario
  "profileImageUrl": "https://...",           // URL de la imagen de perfil (si aplica)
  "role": "user",                             // Rol del usuario (admin, user, etc.)
  "experience": "intermediate",               // Nivel de experiencia del usuario (begginer, intermediate, advanced, pro)
  "playingTime": 0,                           // Tiempo jugado en meses
  "playingStyle": "none",                     // Estilo de juego (defensive, aggressive, general, none)
  "courtTypePreference": "hard",              // Preferencia de tipo de pista (clay, grass, hard)
  "gamesPerWeek": 0,                          // Juegos jugados por semana
  "playerGoals": "none",                      // Objetivos del jugador (competitive, recreational, fitness, none)
  "dominantHand": "right",                    // Mano dominante del jugador (left, right, both)
  "gamePreference": "singles",                // Preferencia de juego (singles, doubles)
  "status": "active",                         // Estado de la cuenta (activo, inactivo, etc.)
  "isDeleted": false,                         // Borrado lógico (en lugar de eliminar el registro)
  "createdAt": ISODate("2023-10-01T10:00:00Z"), // Fecha de creación del registro
  "updatedAt": ISODate("2023-10-01T10:00:00Z"), // Última actualización del registro
  "lastLoginAt": ISODate("2023-10-19T09:30:00Z"), // Última vez que inició sesión
  "activationCode": "123456",                 // Código de activación, en caso de necesitar verificación de cuenta
  "resetPasswordToken": "randomToken",        // Token para restablecer contraseña (opcional)
  "resetPasswordExpires": ISODate("2023-10-20T10:00:00Z"), // Expiración del token de restablecimiento de contraseña
  "twoFactorEnabled": false,                  // Si la autenticación de dos factores está activada
  "loginAttempts": 0,                         // Intentos de inicio de sesión fallidos
  "lockUntil": null                           // Tiempo hasta el cual la cuenta está bloqueada por muchos intentos fallidos
}
*/
