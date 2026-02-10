import { NotFoundException } from '@nestjs/common';
import { AssetsService } from './assets.service';

const createRepo = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('AssetsService (unit)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('retires asset and sets retired status', async () => {
    const assetRepo = createRepo();
    const statusRepo = { findOne: jest.fn() };

    const service = new AssetsService(
      assetRepo as any,
      statusRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    );

    const asset = { id: 1, statusId: 1, retiredAt: null, retiredReason: null, updatedBy: null } as any;
    jest.spyOn(service, 'findOne').mockResolvedValue(asset);
    statusRepo.findOne.mockResolvedValue({ id: 4 });
    assetRepo.save.mockResolvedValue(asset);

    await service.retire(1, { reason: 'Obsoleto' } as any, 99);

    expect(asset.statusId).toBe(4);
    expect(asset.retiredReason).toBe('Obsoleto');
    expect(asset.updatedBy).toBe(99);
    expect(assetRepo.save).toHaveBeenCalledWith(asset);
  });

  it('throws when retired status is missing', async () => {
    const assetRepo = createRepo();
    const statusRepo = { findOne: jest.fn() };
    const service = new AssetsService(
      assetRepo as any,
      statusRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    );

    jest.spyOn(service, 'findOne').mockResolvedValue({ id: 1 } as any);
    statusRepo.findOne.mockResolvedValue(null);

    await expect(service.retire(1, {} as any, 1)).rejects.toBeInstanceOf(NotFoundException);
  });
});
