import { vi } from 'vitest';

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('./api', () => ({
  default: apiMock,
}));

import { assignmentsService } from './assignmentsService';

describe('assignmentsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets assignments with siteId', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { ok: true } });

    const data = await assignmentsService.getAll(2);
    expect(apiMock.get).toHaveBeenCalledWith('/assignments', { params: { siteId: 2 } });
    expect(data).toEqual({ ok: true });
  });

  it('gets assignments without siteId', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { ok: true } });

    const data = await assignmentsService.getAll();
    expect(apiMock.get).toHaveBeenCalledWith('/assignments', { params: {} });
    expect(data).toEqual({ ok: true });
  });

  it('gets active assignments', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { ok: true } });

    const data = await assignmentsService.getActive(1);
    expect(apiMock.get).toHaveBeenCalledWith('/assignments/active', { params: { siteId: 1 } });
    expect(data).toEqual({ ok: true });
  });

  it('creates assignment', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { id: 1 } });

    const payload = { siteId: 1, assetId: 2, employeeId: 3 };
    const data = await assignmentsService.create(payload);
    expect(apiMock.post).toHaveBeenCalledWith('/assignments', payload);
    expect(data).toEqual({ id: 1 });
  });

  it('returns assignment', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { ok: true } });

    const data = await assignmentsService.return(5, { comment: 'ok' });
    expect(apiMock.post).toHaveBeenCalledWith('/assignments/5/return', { comment: 'ok' });
    expect(data).toEqual({ ok: true });
  });

  it('gets assignments by employee', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { ok: true } });

    const data = await assignmentsService.getByEmployee(7);
    expect(apiMock.get).toHaveBeenCalledWith('/assignments/employee/7');
    expect(data).toEqual({ ok: true });
  });

  it('downloads template', async () => {
    const blob = new Blob(['x']);
    apiMock.get.mockResolvedValueOnce({ data: blob });

    const data = await assignmentsService.downloadTemplate();
    expect(apiMock.get).toHaveBeenCalledWith('/assignments/template', { responseType: 'blob' });
    expect(data).toBe(blob);
  });

  it('exports to excel', async () => {
    const blob = new Blob(['x']);
    apiMock.get.mockResolvedValueOnce({ data: blob });

    const data = await assignmentsService.exportToExcel();
    expect(apiMock.get).toHaveBeenCalledWith('/assignments/export/excel', { responseType: 'blob' });
    expect(data).toBe(blob);
  });

  it('imports from excel', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { insertados: 1 } });

    const data = await assignmentsService.importFromExcel([{ id: 1 }]);
    expect(apiMock.post).toHaveBeenCalledWith('/assignments/import/excel', { assignments: [{ id: 1 }] });
    expect(data).toEqual({ insertados: 1 });
  });
});
