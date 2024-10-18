import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { setupTestDB } from '../../test/database-setup';

describe('UsersController', () => {
  setupTestDB();

  let controller: UserController;
  let service: UserService;

  const mockUserModel = {
    find: jest.fn(),
    // Agrega aquí otros métodos que uses en tu servicio
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      const mockUsers = { data: [{ name: 'John Doe' }] };
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockUsers),
      } as any;
      jest.spyOn(service, 'getAllUsers').mockReturnValue(mockQuery);

      const result = await controller.getAllUsers();
      expect(result).toBe(mockUsers);
    });
  });
});
