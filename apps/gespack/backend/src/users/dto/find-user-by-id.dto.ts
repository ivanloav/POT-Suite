export class FindUserByIdDto {
  userId: number;
  userName: string;
  email: string;
  locale: string;
  isCustomer: boolean;
  isAdmin: boolean;
  isActive: boolean;
  isCB: boolean;
  isList: boolean;
  sendDailyOrdersReport: number;
  createdAt: Date;
  totalSite?: number;
  sites?: { siteId: number; siteName: string; }[];
}