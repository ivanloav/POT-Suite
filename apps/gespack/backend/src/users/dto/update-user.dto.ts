export class UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  locale?: string;
  selectedSites?: number[];
  isCustomer?: boolean;
  isAdmin?: boolean;
  isActive?: boolean;
  isCB?: boolean;
  isList?: boolean;
  isDailyOrdersReport?: boolean;
}