import { BadRequestException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserSite } from '../entities/user-site.entity';
import { UserSiteRole } from '../entities/user-site-role.entity';
import { Site } from '../entities/site.entity';

const createRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('AuthService (unit)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws when siteId is missing', async () => {
    const service = new AuthService(
      { manager: { transaction: jest.fn() } } as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    );

    await expect(
      service.register({ email: 'a@b.com', password: '123456', roleCode: 'admin' } as any)
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('registers user and omits passwordHash from response', async () => {
    const userRepo = createRepo();
    const roleRepo = createRepo();
    const userSiteRepo = createRepo();
    const userSiteRoleRepo = createRepo();
    const siteRepo = createRepo();

    const manager = {
      getRepository: (entity: any) => {
        switch (entity) {
          case User:
            return userRepo;
          case Role:
            return roleRepo;
          case UserSite:
            return userSiteRepo;
          case UserSiteRole:
            return userSiteRoleRepo;
          case Site:
            return siteRepo;
          default:
            return userRepo;
        }
      },
    };

    const userRepository = {
      manager: {
        transaction: async (cb: (m: any) => any) => cb(manager),
      },
    };

    roleRepo.findOne.mockResolvedValue({ id: 2, code: 'admin', isActive: true });
    siteRepo.findOne.mockResolvedValue({ siteId: 1, isActive: true });
    userRepo.findOne.mockResolvedValue(null);
    userRepo.create.mockReturnValue({ email: 'a@b.com', passwordHash: 'hash' });
    userRepo.save.mockResolvedValue({ id: 1, email: 'a@b.com', passwordHash: 'hash' });
    userSiteRepo.create.mockReturnValue({});
    userSiteRoleRepo.create.mockReturnValue({});

    jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hash');

    const service = new AuthService(
      userRepository as any,
      roleRepo as any,
      userSiteRoleRepo as any,
      userSiteRepo as any,
      {} as any,
      {} as any
    );

    const result = await service.register({
      email: 'a@b.com',
      password: '123456',
      roleCode: 'admin',
      siteId: 1,
    });

    expect(result).toHaveProperty('email', 'a@b.com');
    expect((result as any).passwordHash).toBeUndefined();
    expect(userSiteRepo.save).toHaveBeenCalled();
    expect(userSiteRoleRepo.save).toHaveBeenCalled();
  });
});
