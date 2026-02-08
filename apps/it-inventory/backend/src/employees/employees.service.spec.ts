import { ConflictException } from '@nestjs/common';
import { EmployeesService } from './employees.service';

const createRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('EmployeesService (unit)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('findAll builds where filters', async () => {
    const repo = createRepo();
    repo.find.mockResolvedValue([]);
    const service = new EmployeesService(repo as any);

    await service.findAll(2, true);

    expect(repo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { siteId: 2, isActive: true },
      })
    );
  });

  it('create throws conflict on duplicate email constraint', async () => {
    const repo = createRepo();
    repo.create.mockReturnValue({});
    repo.save.mockRejectedValue({ code: '23505', constraint: 'ux_employees_site_email' });

    const service = new EmployeesService(repo as any);

    await expect(
      service.create(
        { email: 'a@b.com', firstName: 'A', lastName: 'B', siteId: 1 } as any,
        1
      )
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
