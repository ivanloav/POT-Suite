import { CatalogsService } from './catalogs.service';

const createRepo = () => ({
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('CatalogsService (unit)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('filters sections by siteId when provided', async () => {
    const sectionRepo = createRepo();
    sectionRepo.find.mockResolvedValue([]);

    const service = new CatalogsService(
      createRepo() as any,
      sectionRepo as any,
      createRepo() as any,
      createRepo() as any,
      createRepo() as any,
      createRepo() as any,
      createRepo() as any,
      createRepo() as any,
      createRepo() as any
    );

    await service.getSections(3);

    expect(sectionRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true, siteId: 3 },
      })
    );
  });
});
