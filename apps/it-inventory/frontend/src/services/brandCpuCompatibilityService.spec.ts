import { vi } from 'vitest';
import { brandCpuCompatibilityService } from './brandCpuCompatibilityService';

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('./api', () => ({
  default: apiMock,
}));

describe('brandCpuCompatibilityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets compatibilities by brand', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { data: [{ brandId: 1 }] } });

    const data = await brandCpuCompatibilityService.getByBrand(1);
    expect(apiMock.get).toHaveBeenCalledWith('/asset-brand-cpu-compatibility/brand/1');
    expect(data).toEqual({ data: [{ brandId: 1 }] });
  });

  it('creates compatibility', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { data: { brandId: 1, cpuVendorId: 2 } } });

    const payload = { brandId: 1, cpuVendorId: 2 };
    const data = await brandCpuCompatibilityService.create(payload);
    expect(apiMock.post).toHaveBeenCalledWith('/asset-brand-cpu-compatibility', payload);
    expect(data).toEqual({ data: { brandId: 1, cpuVendorId: 2 } });
  });

  it('deletes compatibility', async () => {
    apiMock.delete.mockResolvedValueOnce({ data: {} });

    await brandCpuCompatibilityService.delete({ brandId: 1, cpuVendorId: 2 });
    expect(apiMock.delete).toHaveBeenCalledWith('/asset-brand-cpu-compatibility', {
      data: { brandId: 1, cpuVendorId: 2 },
    });
  });
});
