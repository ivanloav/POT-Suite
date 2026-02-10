import { exportAssetsToExcel, transformAssetForExport } from './excelHelpers';
import * as XLSX from 'xlsx';
import { vi } from 'vitest';

describe('excelHelpers', () => {
  it('transforms asset fields for export', () => {
    const asset = {
      id: 5,
      siteId: 1,
      site: { code: 'POT' },
      assetTag: 'A-001',
      typeId: 10,
      type: { name: 'Laptop' },
      modelId: 20,
      model: { brand: { name: 'Dell' }, model: 'XPS' },
      sectionId: 3,
      section: { name: 'IT' },
      statusId: 4,
      status: { name: 'Activo' },
      employeeId: 7,
      employee: { firstName: 'Ana', lastName: 'Lopez', secondLastName: 'Ruiz' },
      serial: 'S1',
      imei: 'I1',
      macAddress: 'AA:BB',
      ipAddress: '10.0.0.1',
      uuid: 'uuid-1',
      osVersionId: 99,
      osVersion: { osFamily: { name: 'Windows' }, name: '11' },
      cpuId: 2,
      cpu: { vendor: 'Intel', name: 'i7' },
      ramId: 8,
      ram: { capacityGb: 16, memType: 'DDR4', speedMts: 3200, formFactor: 'SODIMM' },
      storageId: 9,
      storage: { capacityGb: 512, driveType: 'SSD', interface: 'NVMe', formFactor: 'M.2' },
      purchaseDate: '2024-01-01',
      warrantyEnd: '2026-01-01',
      location: 'Madrid',
      notes: 'ok',
      createdAt: '2024-01-02T10:00:00Z',
      updatedAt: '2024-01-03T10:00:00Z',
    };

    const result = transformAssetForExport(asset);
    expect(result['ID']).toBe(5);
    expect(result['Site']).toBe('POT');
    expect(result['Tipo']).toBe('Laptop');
    expect(result['Modelo']).toBe('Dell XPS');
    expect(result['Empleado']).toBe('Ana Lopez Ruiz');
    expect(result['CPU']).toBe('Intel i7');
    expect(result['RAM']).toContain('16GB');
  });

  it('throws when exporting an empty list', () => {
    expect(() => exportAssetsToExcel([])).toThrow('No hay datos para exportar');
  });

  it('exports assets sorted by id and writes a file', () => {
    const writeSpy = vi.spyOn(XLSX, 'writeFile').mockImplementation(() => undefined);
    const jsonToSheetSpy = vi.spyOn(XLSX.utils, 'json_to_sheet');

    const count = exportAssetsToExcel(
      [{ id: 2, assetTag: 'B' }, { id: 1, assetTag: 'A' }],
      'assets.xlsx'
    );

    expect(count).toBe(2);
    expect(writeSpy).toHaveBeenCalledWith(expect.anything(), 'assets.xlsx');

    const firstRow = (jsonToSheetSpy.mock.calls[0][0] as Array<Record<string, any>>)[0];
    expect(firstRow['ID']).toBe(1);

    writeSpy.mockRestore();
    jsonToSheetSpy.mockRestore();
  });
});
