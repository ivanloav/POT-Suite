import { vi } from 'vitest';
import { brandRamCompatibilityService } from './brandRamCompatibilityService';

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('./api', () => ({
  default: apiMock,
}));

describe('brandRamCompatibilityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets compatibilities by brand', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { data: [{ brandId: 1 }] } });

    const data = await brandRamCompatibilityService.getByBrand(1);
    expect(apiMock.get).toHaveBeenCalledWith('/asset-brand-ram-compatibility/brand/1');
    expect(data).toEqual({ data: [{ brandId: 1 }] });
  });

  it('creates compatibility', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { data: { brandId: 1, ramTypeId: 2 } } });

    const payload = { brandId: 1, ramTypeId: 2 };
    const data = await brandRamCompatibilityService.create(payload);
    expect(apiMock.post).toHaveBeenCalledWith('/asset-brand-ram-compatibility', payload);
    expect(data).toEqual({ data: { brandId: 1, ramTypeId: 2 } });
  });

  it('deletes compatibility', async () => {
    apiMock.delete.mockResolvedValueOnce({ data: {} });

    await brandRamCompatibilityService.delete({ brandId: 1, ramTypeId: 2 });
    expect(apiMock.delete).toHaveBeenCalledWith('/asset-brand-ram-compatibility', {
      data: { brandId: 1, ramTypeId: 2 },
    });
  });
});
