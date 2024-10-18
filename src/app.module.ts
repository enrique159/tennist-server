import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseEnv from './config/database.config';
import serverEnv from './config/server.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseEnv, serverEnv],
    }),
    MongooseModule.forRoot(databaseEnv().database.uri),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
