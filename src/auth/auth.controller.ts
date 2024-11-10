import * as bcrypt from 'bcrypt';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { compareCurrentDateWithLockUntil } from '@/shared/utils/compareDates';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '@/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() signinDto: SignInDto) {
    const { emailPhone, password } = signinDto;
    const user = await this.authService.findByEmailOrPhone(emailPhone);
    if (!user) {
      throw new NotFoundException(
        'No user found with that email or phone number',
      );
    }

    // Verify if the user is locked out
    if (
      user.lockUntil &&
      compareCurrentDateWithLockUntil(new Date(), user.lockUntil)
    ) {
      throw new UnauthorizedException(
        'Your account is locked out, wait a few minutes before trying again',
      );
    } else if (
      user.lockUntil &&
      !compareCurrentDateWithLockUntil(new Date(), user.lockUntil)
    ) {
      await this.authService.unlockAccount(user.email);
    } else if (user.loginAttempts >= 5) {
      await this.authService.lockAccount(user.email);
      await this.authService.resetLoginAttempts(user.email);
      throw new UnauthorizedException(
        'Your account is locked out, wait a few minutes before trying again',
      );
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      await this.authService.addLoginAttempt(user.email);
      const remainingAttempts = 5 - (user.loginAttempts + 1);
      throw new UnauthorizedException(
        `The password is incorrect. You have ${remainingAttempts} attempt(s) left before your account is locked.`,
      );
    }

    await this.authService.addLastLoginAndResetLoginAttempts(user.email);

    const signInResponse = new SignInResponseDto(
      await this.jwtService.signAsync({ email: user.email }),
      user,
    );

    return signInResponse.returnSignInResponse();
  }

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    const response = await this.authService.createUser(createUserDto);
    const signUpResponse = new SignInResponseDto(
      await this.jwtService.signAsync({ email: response.email }),
      response,
    );
    return signUpResponse.returnSignInResponse();
  }
}
