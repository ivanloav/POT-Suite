import { vi } from 'vitest';
import { brandOsCompatibilityService } from './brandOsCompatibilityService';

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('./api', () => ({
  default: apiMock,
}));

describe('brandOsCompatibilityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets compatibilities by brand', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { data: [{ brandId: 1 }] } });

    const data = await brandOsCompatibilityService.getByBrand(1);
    expect(apiMock.get).toHaveBeenCalledWith('/asset-brand-os-compatibility/brand/1');
    expect(data).toEqual({ data: [{ brandId: 1 }] });
  });

  it('creates compatibility', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { data: { brandId: 1, osFamilyId: 2 } } });

    const payload = { brandId: 1, osFamilyId: 2 };
    const data = await brandOsCompatibilityService.create(payload);
    expect(apiMock.post).toHaveBeenCalledWith('/asset-brand-os-compatibility', payload);
    expect(data).toEqual({ data: { brandId: 1, osFamilyId: 2 } });
  });

  it('deletes compatibility', async () => {
    apiMock.delete.mockResolvedValueOnce({ data: {} });

    await brandOsCompatibilityService.delete({ brandId: 1, osFamilyId: 2 });
    expect(apiMock.delete).toHaveBeenCalledWith('/asset-brand-os-compatibility', {
      data: { brandId: 1, osFamilyId: 2 },
    });
  });
});
