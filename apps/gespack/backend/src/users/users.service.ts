import { ConflictException, BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserSite } from '../entities/user-site.entity';
import { Site } from '../entities/site.entity';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { FindUserByIdDto } from './dto/find-user-by-id.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { parseBool, parseNumber, parseDateRange } from '../shared/utils/type-parsers';
import * as bcrypt from 'bcrypt';

export type SortableKey =
  | 'userId'
  | 'userName'
  | 'email'
  | 'isCustomer'
  | 'isCB'
  | 'isList'
  | 'totalSite'
  | 'sendDailyOrdersReport'
  | 'isAdmin'
  | 'isActive'
  | 'createdAt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    //private readonly dataSource: DataSource,
    @InjectRepository(UserSite)
    private readonly userSiteRepository: Repository<UserSite>,
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new ConflictException(`Ya existe un usuario con el email: ${createUserDto.email}`);
    }
  
    if (createUserDto.selectedSites && createUserDto.selectedSites.length > 0) {
      const existingSites = await this.siteRepository.find({
        where: createUserDto.selectedSites.map(siteId => ({ siteId }))
      });

      if (existingSites.length !== createUserDto.selectedSites.length) {
        throw new BadRequestException('Uno o más sites seleccionados no existen');
      }
    }

    return await this.dataSource.transaction(async manager => {
      const userData = {
        userName: createUserDto.name,
        email: createUserDto.email,
        userPassword: await bcrypt.hash(createUserDto.password, 10),
        locale: createUserDto.locale || 'es',
        isCustomer: createUserDto.isCustomer ?? false,
        isAdmin: createUserDto.isAdmin ?? false,
        isActive: createUserDto.isActive ?? false,
        isCB: createUserDto.isCB ?? false,
        isList: createUserDto.isList ?? false,
        sendDailyOrdersReport: createUserDto.isDailyOrdersReport ? 1 : 0,
        totalSite: createUserDto.selectedSites?.length || 0,
      };

      const user = manager.create(User, userData);
      const savedUser = await manager.save(User, user);

      if (createUserDto.selectedSites && createUserDto.selectedSites.length > 0) {
        const userSiteRelations = createUserDto.selectedSites.map(siteId =>
          manager.create(UserSite, {
            userId: savedUser.userId,
            siteId: siteId
          })
        );
        await manager.save(UserSite, userSiteRelations);
        console.log(`✅ Usuario ${savedUser.userName} creado con ${userSiteRelations.length} sites asignados`);
      }
      return savedUser;
    });
  }

  async findAll(params: FindAllUsersDto): Promise<{ data: any[]; total: number }> {
    const {
      page,
      limit,
      sortBy,
      sortDir,
      qId,
      qUserName,
      qEmail,
      qIsCustomer,
      qIsCB,
      qIsList,
      qTotalSite,
      qSendDailyOrdersReport,
      qIsAdmin,
      qIsActive,
      qCreated,
    } = params;

    const validSortKeys: Record<string, string> = {
      userId: 'u.userId',
      userName: 'u.userName',
      email: 'u.email',
      isCustomer: 'u.isCustomer',
      isCB: 'u.isCB',
      isList: 'u.isList',
      sendDailyOrdersReport: 'u.sendDailyOrdersReport',
      isAdmin: 'u.isAdmin',
      isActive: 'u.isActive',
      createdAt: 'u.createdAt',
      totalSite: '"totalSite"',
    };

    const orderBy = validSortKeys[sortBy] ?? 'u.userId';

    // Normaliza filtros
    const fId = parseNumber(qId);
    const fIsCustomer = parseBool(qIsCustomer);
    const fIsCB = parseBool(qIsCB);
    const fIsList = parseBool(qIsList);
    const fIsAdmin = parseBool(qIsAdmin);
    const fIsActive = parseBool(qIsActive);
    const fTotalSite = parseNumber(qTotalSite);
    const fSendDailyOrdersReport = parseBool(qSendDailyOrdersReport);

    const { from: createdFrom, to: createdTo } = parseDateRange(qCreated);

    // BASE: join con user_site para totalSite
    const qb = this.userRepository
      .createQueryBuilder('u')
      .leftJoin('user_site', 'us', 'us.user_id = u.user_id');

    // SELECT con alias camelCase que espera el frontend
    qb.select([
      'u.userId AS "userId"',
      'u.userName AS "userName"',
      'u.email AS "email"',
      'u.isCustomer AS "isCustomer"',
      'u.isCB AS "isCB"',
      'u.isList AS "isList"',
      'u.sendDailyOrdersReport AS "sendDailyOrdersReport"',
      'u.isAdmin AS "isAdmin"',
      'u.isActive AS "isActive"',
      'u.createdAt AS "createdAt"',
      'COUNT(DISTINCT us.site_id) AS "totalSite"',
    ]);

    // Filtros WHERE
    if (typeof fId === 'number') {
      qb.andWhere('u.userId = :id', { id: fId });
    }
    if (qUserName) {
      qb.andWhere('LOWER(u.userName) LIKE :uname', { uname: `%${qUserName.toLowerCase()}%` });
    }
    if (qEmail) {
      qb.andWhere('LOWER(u.email) LIKE :mail', { mail: `%${qEmail.toLowerCase()}%` });
    }
    if (typeof fIsCustomer === 'boolean') {
      qb.andWhere('u.isCustomer = :isCustomer', { isCustomer: fIsCustomer });
    }
    if (typeof fIsCB === 'boolean') {
      qb.andWhere('u.isCB = :isCB', { isCB: fIsCB });
    }
    if (typeof fIsList === 'boolean') {
      qb.andWhere('u.isList = :isList', { isList: fIsList });
    }
    if (typeof fSendDailyOrdersReport === 'boolean') {
      qb.andWhere('u.sendDailyOrdersReport = :sdor', { sdor: fSendDailyOrdersReport ? 1 : 0 });
    }
    if (typeof fIsAdmin === 'boolean') {
      qb.andWhere('u.isAdmin = :isAdmin', { isAdmin: fIsAdmin });
    }
    if (typeof fIsActive === 'boolean') {
      qb.andWhere('u.isActive = :isActive', { isActive: fIsActive });
    }
    if (createdFrom && createdTo) {
      qb.andWhere('DATE(u.createdAt) BETWEEN :from AND :to', { from: createdFrom, to: createdTo });
    } else if (createdFrom) {
      qb.andWhere('DATE(u.createdAt) = :d', { d: createdFrom });
    }

    // GROUP BY para poder contar totalSite
    qb.groupBy('u.userId')
      .addGroupBy('u.userName')
      .addGroupBy('u.email')
      .addGroupBy('u.isCustomer')
      .addGroupBy('u.isCB')
      .addGroupBy('u.isList')
      .addGroupBy('u.sendDailyOrdersReport')
      .addGroupBy('u.isAdmin')
      .addGroupBy('u.isActive')
      .addGroupBy('u.createdAt');

    // HAVING para totalSite si lo han filtrado
    if (typeof fTotalSite === 'number') {
      qb.having('COUNT(DISTINCT us.site_id) = :ts', { ts: fTotalSite });
    }

    // Ordenación usando mapping con validación de sortDir
    const orderDir = sortDir === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(orderBy, orderDir);
      
    // Paginación (sobre agrupación)
    qb.offset((page - 1) * limit).limit(limit);

    const data = await qb.getRawMany<any>();

    // Total: duplicamos filtros en un contador mínimo (group by userId)
    const countQb = this.userRepository
      .createQueryBuilder('u')
      .leftJoin('user_site', 'us', 'us.user_id = u.user_id');

    if (typeof fId === 'number') countQb.andWhere('u.userId = :id', { id: fId });
    if (qUserName) countQb.andWhere('LOWER(u.userName) LIKE :uname', { uname: `%${qUserName.toLowerCase()}%` });
    if (qEmail) countQb.andWhere('LOWER(u.email) LIKE :mail', { mail: `%${qEmail.toLowerCase()}%` });
    if (typeof fIsCustomer === 'boolean') countQb.andWhere('u.isCustomer = :isCustomer', { isCustomer: fIsCustomer });
    if (typeof fIsCB === 'boolean') countQb.andWhere('u.isCB = :isCB', { isCB: fIsCB });
    if (typeof fIsList === 'boolean') countQb.andWhere('u.isList = :isList', { isList: fIsList });
    if (typeof fSendDailyOrdersReport === 'boolean') countQb.andWhere('u.sendDailyOrdersReport = :sdor', { sdor: fSendDailyOrdersReport ? 1 : 0 });
    if (typeof fIsAdmin === 'boolean') countQb.andWhere('u.isAdmin = :isAdmin', { isAdmin: fIsAdmin });
    if (typeof fIsActive === 'boolean') countQb.andWhere('u.isActive = :isActive', { isActive: fIsActive });
    if (createdFrom && createdTo) countQb.andWhere('DATE(u.createdAt) BETWEEN :from AND :to', { from: createdFrom, to: createdTo });
    else if (createdFrom) countQb.andWhere('DATE(u.createdAt) = :d', { d: createdFrom });

    if (typeof fTotalSite === 'number') countQb.having('COUNT(DISTINCT us.site_id) = :ts', { ts: fTotalSite });

    countQb.select('u.userId', 'userId').groupBy('u.userId');

    const countRows = await countQb.getRawMany();
    const total = countRows.length;

    return { data, total };
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { userName: username } });
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findSitesForUser(userId: number): Promise<{ siteId: number }[]> {
    return await this.dataSource
      .getRepository(UserSite)
      .createQueryBuilder('us')
      .select('us.site_id', 'site_id')
      .where('us.user_id = :userId', { userId })
      .getRawMany();
  }

  async findUserById(userId: number): Promise<FindUserByIdDto | undefined> {
    try {
      const userExists = await this.userRepository
        .createQueryBuilder('u')
        .select('u.user_id')
        .where('u.user_id = :userId', { userId })
        .getExists();

      if (!userExists) {
        console.log("❌ Usuario no encontrado en la base de datos");
        return null;
      }

      const result = await this.userRepository
        .createQueryBuilder('u')
        .leftJoin('user_site', 'us', 'us.user_id = u.user_id')
        .leftJoin('sites', 's', 's.site_id = us.site_id')
        .select([
          'u.user_id AS "userId"',
          'u.user_name AS "userName"',
          'u.email AS "email"',
          'u.locale AS "locale"',
          'u.is_customer AS "isCustomer"',
          'u.is_admin AS "isAdmin"',
          'u.is_active AS "isActive"',
          'u.is_cb AS "isCB"',
          'u.is_list AS "isList"',
          'u.send_daily_orders_report AS "sendDailyOrdersReport"',
          'u.created_at AS "createdAt"',
          's.site_id AS "siteId"',
          's.site_name AS "siteName"'
        ])
        .where('u.user_id = :userId', { userId })
        .getRawMany();

      if (!result || result.length === 0) {
        console.log("❌ Usuario no encontrado después de la consulta");
        return null;
      }

      const userData = result[0];
      const sites = result
        .filter(row => row.siteId)
        .map(row => ({ 
          siteId: row.siteId, 
          siteName: row.siteName 
        }));

      const finalUser: FindUserByIdDto = {
        userId: userData.userId,
        userName: userData.userName,
        email: userData.email,
        locale: userData.locale || '',
        isCustomer: Boolean(userData.isCustomer),
        isAdmin: Boolean(userData.isAdmin),
        isActive: Boolean(userData.isActive),
        isCB: Boolean(userData.isCB),
        isList: Boolean(userData.isList),
        sendDailyOrdersReport: Number(userData.sendDailyOrdersReport) || 0,
        createdAt: userData.createdAt,
        totalSite: sites.length, // 👈 AÑADIR totalSite como en el DTO
        sites: sites
      };

      return finalUser;

    } catch (error) {
      console.error("Error al buscar usuario:", error);
      throw error
    }
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<FindUserByIdDto | null> {
    const existingUser = await this.userRepository.findOne({ where: { userId } });
    if (!existingUser) {
      return null;
    }

    try {
      // 👈 MAPEAR correctamente a nombres de columna de DB
      const updateData: any = {};
      
      if (updateUserDto.name !== undefined) updateData.userName = updateUserDto.name;
      if (updateUserDto.email !== undefined) updateData.email = updateUserDto.email;
      if (updateUserDto.locale !== undefined) updateData.locale = updateUserDto.locale;
      if (updateUserDto.isCustomer !== undefined) updateData.isCustomer = updateUserDto.isCustomer;
      if (updateUserDto.isAdmin !== undefined) updateData.isAdmin = updateUserDto.isAdmin;
      if (updateUserDto.isActive !== undefined) updateData.isActive = updateUserDto.isActive;
      if (updateUserDto.isCB !== undefined) updateData.isCB = updateUserDto.isCB;
      if (updateUserDto.isList !== undefined) updateData.isList = updateUserDto.isList;
      if (updateUserDto.isDailyOrdersReport !== undefined) {
        updateData.sendDailyOrdersReport = updateUserDto.isDailyOrdersReport ? 1 : 0;
      }

      // Hash password si se proporciona
      if (updateUserDto.password && updateUserDto.password.trim()) {
        updateData.userPassword = await bcrypt.hash(updateUserDto.password, 10);
      }

      await this.userRepository
        .createQueryBuilder()
        .update()
        .set(updateData) // 👈 USAR objeto mapeado
        .where('user_id = :userId', { userId })
        .execute();

      return this.findUserById(userId);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      throw error;
    }
  }
}
