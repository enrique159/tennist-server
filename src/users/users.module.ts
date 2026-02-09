import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { IsEmailUniqueConstraint } from './validators/is-email-unique.validator';
import { IsPhoneNumberUniqueConstraint } from './validators/is-phone-unique.validator';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { FilesModule } from '../files/files.module';
import { FilesService } from '@/files/files.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), FilesModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    IsEmailUniqueConstraint,
    IsPhoneNumberUniqueConstraint,
    FilesService
  ],
})
export class UsersModule {}
