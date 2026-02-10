import { AssignmentsService } from './assignments.service';

const createRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  count: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('AssignmentsService (unit)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws when assigned status is missing', async () => {
    const assignmentRepo = createRepo();
    const assetRepo = createRepo();
    const statusRepo = createRepo();

    assignmentRepo.findOne.mockResolvedValue(null);
    assignmentRepo.create.mockReturnValue({});
    assignmentRepo.save.mockResolvedValue({ id: 1 });
    statusRepo.findOne.mockResolvedValue(null);

    const service = new AssignmentsService(
      assignmentRepo as any,
      assetRepo as any,
      statusRepo as any,
      {} as any,
      {} as any
    );

    await expect(
      service.create({ siteId: 1, assetId: 1, employeeId: 1 } as any, 1)
    ).rejects.toThrow('Estado "assigned" no encontrado en la base de datos');
  });

  it('throws when returning an already returned assignment', async () => {
    const assignmentRepo = createRepo();
    assignmentRepo.findOne.mockResolvedValue({ id: 1, returnedAt: new Date(), assetId: 1 });

    const service = new AssignmentsService(
      assignmentRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    );

    await expect(service.returnAsset(1, {} as any)).rejects.toThrow('Esta asignación ya fue devuelta');
  });
});
