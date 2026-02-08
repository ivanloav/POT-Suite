// backend/src/shared/guards/site.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { UserSite } from '../../entities/user-site.entity';

@Injectable()
export class SiteGuard implements CanActivate {
  constructor(
    @InjectRepository(UserSite)
    private userSiteRepository: Repository<UserSite>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: any }>();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // 👈 CONSULTAR sitios desde BD
    const userSites = await this.userSiteRepository.find({
      where: { userId: user.userId },
      select: ['siteId']
    });

    // 👈 CONVERTIR a numbers explícitamente
    const userSiteIds = userSites.map(us => Number(us.siteId));
    const requestedSiteId =
      Number(request.query['site_id']) ||
      Number(request.body?.site_id) ||
      Number(request.headers['x-site-id']);

    // 👈 PERMITIR site_id = 0 para configuración global
    if (requestedSiteId && !isNaN(requestedSiteId) && !userSiteIds.includes(requestedSiteId)) {
      throw new ForbiddenException(`Acceso denegado al site_id ${requestedSiteId}`);
    }

    (request as any).context = {
      ...(request as any).context,
      siteId: requestedSiteId || undefined,
      userSiteIds,
    };

    return true;
  }
}