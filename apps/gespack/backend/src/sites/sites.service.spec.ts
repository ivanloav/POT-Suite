import { Test, TestingModule } from '@nestjs/testing';
import { SitesService } from './sites.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Site } from '../entities/site.entity';
import { Repository } from 'typeorm';
import { CreateSiteDto } from './dto/create-site.dto';

// Crear un mock del repositorio de TypeORM
const mockSiteRepository = () => ({
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('SitesService', () => {
  let service: SitesService;
  let repository: MockRepository<Site>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SitesService,
        {
          provide: getRepositoryToken(Site),
          useFactory: mockSiteRepository,
        },
      ],
    }).compile();

    service = module.get<SitesService>(SitesService);
    repository = module.get(getRepositoryToken(Site));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debe devolver los sitios activos', async () => {
      const expectedSites = [
        { site_id: 1, site_name: 'Madrid' },
        { site_id: 2, site_name: 'Barcelona' },
      ];

      repository.find.mockResolvedValue(expectedSites);

      const result = await service.findAll();
      expect(result).toEqual(expectedSites);
      expect(repository.find).toHaveBeenCalledWith({
        select: ['site_id', 'site_name'],
        where: { is_active: true },
        order: { site_name: 'ASC' },
      });
    });
  });

  describe('create', () => {
    it('debe crear y guardar un nuevo sitio', async () => {
      const dto: CreateSiteDto = {
        siteName: 'Valencia',
        siteDescription: '',
        contactInfo: '',
        isActive: false,
        createdAt: undefined,
        updatedAt: undefined
      };
      const createdSite = { siteId: 3, siteName: 'Valencia' };

      repository.create.mockReturnValue(createdSite);
      repository.save.mockResolvedValue(createdSite);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(createdSite);
      expect(result).toEqual(createdSite);
    });
  });
});