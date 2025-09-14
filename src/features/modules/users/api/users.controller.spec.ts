import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { UserDto } from '../dto/user.dto';
import { UsersController } from './users.controller';
import { UsersService } from '../application/users.service';
import { ISortDirections } from '../../../base/interfaces/sort-directions.interface';

const createUserDto: UserDto = {
  login: 'test1',
  password: '123456789',
  email: 'test1@gmail.com',
};

describe('UsersController', () => {
  let usersService: UsersService;
  let usersController: UsersController;

  beforeEach(async () => {
    const mockUsersService = {
      getUserByLoginOrEmail: jest.fn(),
      addUser: jest
        .fn()
        .mockImplementation((user: UserDto) =>
          Promise.resolve({ id: '1', ...user }),
        ),
      removeUser: jest.fn().mockImplementation((id: string) =>
        Promise.resolve({
          id,
          lastName: 'lastName #1',
          firstName: 'firstName #1',
        }),
      ),
      getUsers: jest.fn().mockResolvedValue([
        {
          lastName: 'lastName #1',
          firstName: 'firstName #1',
        },
        {
          lastName: 'lastName #2',
          firstName: 'firstName #2',
        },
      ]),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn().mockImplementation((command) => {
              const user = mockUsersService.getUserByLoginOrEmail();

              if (!user) {
                return mockUsersService.addUser(command.createUserDto);
              }
            }),
          },
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    usersService = app.get<UsersService>(UsersService);
    usersController = app.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('create()', () => {
    it('should create a user', () => {
      usersController.postUsers(createUserDto);
      expect(usersController.postUsers(createUserDto)).resolves.toEqual({
        id: '1',
        ...createUserDto,
      });

      expect(usersService.addUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll()', () => {
    it('should find all users ', () => {
      usersController.getUsers(
        'login',
        'email',
        10,
        1,
        'createdAt',
        ISortDirections.DESC,
      );

      expect(usersService.getUsers).toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('should find a user', () => {
      expect(usersController.postUsers(createUserDto)).resolves.toEqual({
        id: '1',
        ...createUserDto,
      });

      expect(usersService.getUserByLoginOrEmail).toHaveBeenCalled();
    });
  });

  describe('remove()', () => {
    it('should remove the user', () => {
      usersController.deleteUser('2');

      expect(usersService.removeUser).toHaveBeenCalled();
    });
  });
});
