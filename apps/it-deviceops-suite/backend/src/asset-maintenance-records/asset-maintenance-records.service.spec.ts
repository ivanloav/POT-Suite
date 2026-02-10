import { NotFoundException } from '@nestjs/common';
import { AssetMaintenanceRecordsService } from './asset-maintenance-records.service';

const createRepo = () => ({
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('AssetMaintenanceRecordsService (unit)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws when record not found', async () => {
    const recordRepo = createRepo();
    recordRepo.findOne.mockResolvedValue(null);

    const service = new AssetMaintenanceRecordsService(recordRepo as any);

    await expect(service.getById(1)).rejects.toBeInstanceOf(NotFoundException);
  });
});
