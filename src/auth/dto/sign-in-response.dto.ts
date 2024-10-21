import { User } from '@/users/domain/user';

const modelFields = [
  '_id',
  'username',
  'email',
  'emailVerified',
  'phoneNumber',
  'fullName',
  'profileImageUrl',
  'role',
] as const;

export class SignInResponseDto {
  token: string;
  user: User;

  constructor(token: string, user: User) {
    this.token = token;
    this.user = user;
  }

  public returnSignInResponse() {
    const filteredUser = {} as Record<(typeof modelFields)[number], any>;

    for (const field of modelFields) {
      if (field in this.user) {
        filteredUser[field] = this.user[field];
      }
    }

    return {
      token: this.token,
      user: filteredUser,
    };
  }
}
