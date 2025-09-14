import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from '../infrastructure/users.repository';
import { ISortDirections } from '../../../base/interfaces/sort-directions.interface';

const oneUser = {
  lastName: 'lastName #1',
  firstName: 'firstName #1',
};

const userArray = [
  {
    lastName: 'lastName #1',
    firstName: 'firstName #1',
  },
  {
    lastName: 'lastName #2',
    firstName: 'firstName #2',
  },
];

describe('UserService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'UsersRepository',
          useValue: {
            deleteUser: jest.fn(),
            findUser: jest.fn().mockResolvedValue(oneUser),
            createUser: jest.fn().mockResolvedValue(oneUser),
            findUsers: jest.fn().mockResolvedValue(userArray),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>('UsersRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should successfully insert a user', () => {
      const oneUser = {
        firstName: 'firstName #1',
        lastName: 'lastName #1',
      };

      expect(
        service.addUser(
          {
            login: 'test1',
            password: '123456789',
            email: 'test1@gmail.com',
          },
          true,
        ),
      ).resolves.toEqual(oneUser);
    });
  });

  describe('findAll()', () => {
    it('should return an array of users', async () => {
      const users = await service.getUsers({
        pageSize: 10,
        pageNumber: 1,
        sortBy: 'createdAt',
        sortDirection: ISortDirections.DESC,
      });

      expect(users).toEqual(userArray);
    });
  });

  describe('findOne()', () => {
    it('should get a single user', () => {
      const repoSpy = jest.spyOn(repository, 'findUser');

      expect(service.getUser('1')).resolves.toEqual(oneUser);
      expect(repoSpy).toBeCalledWith('1');
    });
  });

  describe('remove()', () => {
    it('should call remove with the passed value', async () => {
      const removeSpy = jest.spyOn(repository, 'deleteUser');
      const retVal = await service.removeUser('2');

      expect(removeSpy).toBeCalledWith('2');
      expect(retVal).toBeUndefined();
    });
  });
});
