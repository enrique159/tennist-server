import { User } from '@/users/domain/user';

const modelFields = [
  'id',
  'username',
  'email',
  'emailVerified',
  'phoneNumber',
  'fullName',
  'profileImageUrl',
  'role',
  'gender',
  'age',
  'experience',
  'playingTime',
  'playingStyle',
  'courtTypePreference',
  'gamePreference',
  'gamesPerWeek',
  'playerGoals',
  'dominantHand',
] as const;

export class UserExperienceResponseDto {
  user: User;

  constructor(user: User) {
    this.user = user;
  }

  public returnUserExperience(): UserExperienceResponseDto {
    const filteredUser = {} as Record<(typeof modelFields)[number], any>;

    for (const field of modelFields) {
      if (field in this.user) {
        filteredUser[field] = this.user[field];
      }
    }

    return filteredUser as unknown as UserExperienceResponseDto;
  }
}
