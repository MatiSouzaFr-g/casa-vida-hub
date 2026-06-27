import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from '../../users/usuario.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Rol[]>('roles', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!roles) return true;
    const { user } = ctx.switchToHttp().getRequest();
    if (!roles.includes(user.rol)) {
      throw new ForbiddenException('No tenés permisos para esta acción');
    }
    return true;
  }
}
