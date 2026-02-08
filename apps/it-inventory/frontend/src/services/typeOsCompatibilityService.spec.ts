import { vi } from 'vitest';
import { typeOsCompatibilityService } from './typeOsCompatibilityService';

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('./api', () => ({
  default: apiMock,
}));

describe('typeOsCompatibilityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets compatibilities by type', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { data: [{ typeId: 1 }] } });

    const data = await typeOsCompatibilityService.getByType(1);
    expect(apiMock.get).toHaveBeenCalledWith('/asset-type-os-compatibility/type/1');
    expect(data).toEqual({ data: [{ typeId: 1 }] });
  });

  it('creates compatibility', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { data: { typeId: 1, osFamilyId: 2 } } });

    const payload = { typeId: 1, osFamilyId: 2 };
    const data = await typeOsCompatibilityService.create(payload);
    expect(apiMock.post).toHaveBeenCalledWith('/asset-type-os-compatibility', payload);
    expect(data).toEqual({ data: { typeId: 1, osFamilyId: 2 } });
  });

  it('deletes compatibility', async () => {
    apiMock.delete.mockResolvedValueOnce({ data: {} });

    await typeOsCompatibilityService.delete({ typeId: 1, osFamilyId: 2 });
    expect(apiMock.delete).toHaveBeenCalledWith('/asset-type-os-compatibility', {
      data: { typeId: 1, osFamilyId: 2 },
    });
  });
});
