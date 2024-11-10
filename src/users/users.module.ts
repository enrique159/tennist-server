import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AwsService } from '../shared/services/aws.services';
import { IsEmailUniqueConstraint } from './validators/is-email-unique.validator';
import { IsPhoneNumberUniqueConstraint } from './validators/is-phone-unique.validator';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [UserController],
  providers: [
    UserService,
    IsEmailUniqueConstraint,
    IsPhoneNumberUniqueConstraint,
    AwsService,
  ],
})
export class UsersModule {}
