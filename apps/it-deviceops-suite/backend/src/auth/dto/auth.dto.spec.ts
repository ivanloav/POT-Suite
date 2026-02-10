import { validate } from 'class-validator';
import { RegisterUserDto } from './auth.dto';

const buildDto = (overrides: Partial<RegisterUserDto> = {}) => {
  const dto = new RegisterUserDto();
  dto.email = 'test@example.com';
  dto.password = 'securePass123';
  dto.roleCode = 'admin';
  dto.siteId = 1;
  Object.assign(dto, overrides);
  return dto;
};

describe('RegisterUserDto', () => {
  it('is valid with required fields', async () => {
    const dto = buildDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('fails with invalid email', async () => {
    const dto = buildDto({ email: 'not-an-email' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('fails with missing siteId', async () => {
    const dto = buildDto({ siteId: undefined as any });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
