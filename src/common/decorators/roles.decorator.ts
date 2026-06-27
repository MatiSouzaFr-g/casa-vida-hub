// roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Rol } from '../../users/usuario.schema';
export const Roles = (...roles: Rol[]) => SetMetadata('roles', roles);
