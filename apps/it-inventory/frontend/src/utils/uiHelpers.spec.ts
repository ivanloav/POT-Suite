import { getOSFamilyColor, getSiteColor, getStatusBadgeColor } from './uiHelpers';

describe('uiHelpers', () => {
  it('returns a fixed color for known sites', () => {
    expect(getSiteColor('POT')).toContain('bg-blue-100');
    expect(getSiteColor('SCAMP')).toContain('bg-purple-100');
  });

  it('returns deterministic colors for unknown sites', () => {
    const first = getSiteColor('UNKNOWN');
    const second = getSiteColor('UNKNOWN');
    expect(first).toBe(second);
  });

  it('returns default badge color when status class is missing', () => {
    expect(getStatusBadgeColor()).toContain('bg-gray-100');
  });

  it('returns a fixed color for known OS families', () => {
    expect(getOSFamilyColor('Windows')).toContain('bg-purple-100');
    expect(getOSFamilyColor('Android')).toContain('bg-orange-100');
  });
});
