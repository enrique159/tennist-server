import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UsersService } from './users.service';
import { AwsService } from '../shared/services/aws.services';
import { IsEmailUniqueConstraint } from './validators/is-email-unique.validator';
import { IsPhoneNumberUniqueConstraint } from './validators/is-phone-unique.validator';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { FilesModule } from '../files/files.module';
import { FilesService } from '@/files/files.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), FilesModule],
  controllers: [UserController],
  providers: [
    UsersService,
    IsEmailUniqueConstraint,
    IsPhoneNumberUniqueConstraint,
    AwsService,
    FilesService
  ],
})
export class UsersModule {}
