import { ConflictException, NotFoundException } from '@nestjs/common';
import { AssetMaintenancePlansService } from './asset-maintenance-plans.service';

const createRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('AssetMaintenancePlansService (unit)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws when plan not found', async () => {
    const planRepo = createRepo();
    const recordRepo = createRepo();
    const holidayRepo = createRepo();
    planRepo.findOne.mockResolvedValue(null);

    const service = new AssetMaintenancePlansService(planRepo as any, recordRepo as any, holidayRepo as any);

    await expect(service.getById(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates maintenance record and updates plan on complete', async () => {
    const planRepo = createRepo();
    const recordRepo = createRepo();
    const holidayRepo = createRepo();

    const plan = {
      id: 10,
      siteId: 1,
      assetId: 2,
      frequencyDays: 7,
      nextDueDate: new Date('2026-02-01T00:00:00Z'),
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00Z'),
    };

    planRepo.findOne.mockResolvedValue(plan);
    recordRepo.create.mockReturnValue({ id: 99 });
    recordRepo.save.mockResolvedValue({ id: 99 });
    planRepo.update.mockResolvedValue({});

    const service = new AssetMaintenancePlansService(planRepo as any, recordRepo as any, holidayRepo as any);

    const performedAt = '2026-02-01T10:00:00Z';
    await service.complete(10, { performedAt, notes: 'OK' }, 5);

    expect(recordRepo.create).toHaveBeenCalled();
    expect(recordRepo.save).toHaveBeenCalled();
    expect(planRepo.update).toHaveBeenCalled();

    const updateArgs = planRepo.update.mock.calls[0][1];
    expect(updateArgs.lastDoneAt).toBeInstanceOf(Date);
    expect(updateArgs.lastDoneAt.getTime()).toBe(new Date(performedAt).getTime());
    expect(updateArgs.nextDueDate).toBe('2026-02-08');
  });

  it('throws conflict when create violates unique constraint', async () => {
    const planRepo = createRepo();
    const recordRepo = createRepo();
    const holidayRepo = createRepo();

    planRepo.create.mockReturnValue({});
    planRepo.save.mockRejectedValue({ code: '23505' });

    const service = new AssetMaintenancePlansService(planRepo as any, recordRepo as any, holidayRepo as any);

    await expect(
      service.create({ siteId: 1, assetId: 2, title: 'Test', frequencyDays: 7, nextDueDate: '2026-02-01' } as any, 1)
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
