import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Request, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GruposService } from './grupos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Rol } from '../users/usuario.schema';

@ApiTags('Grupos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('grupos')
export class GruposController {
  constructor(private readonly svc: GruposService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Rol.PASTOR, Rol.LIDER)
  @ApiOperation({ summary: 'Crear grupo' })
  crear(@Body() body: any, @Request() req) {
    return this.svc.crear(body.nombre, body.descripcion, body.foto, req.user.sub);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Rol.PASTOR)
  @ApiOperation({ summary: 'Listar todos los grupos (pastor)' })
  todos() {
    return this.svc.listarTodos();
  }

  @Get('mi-grupo')
  @ApiOperation({ summary: 'Ver mi grupo' })
  miGrupo(@Request() req) {
    return this.svc.miGrupo(req.user.grupoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver un grupo' })
  verUno(@Param('id') id: string) {
    return this.svc.verUno(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Rol.PASTOR, Rol.LIDER)
  @ApiOperation({ summary: 'Actualizar grupo' })
  actualizar(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.svc.actualizar(id, body, req.user.sub);
  }

  @Post(':id/miembros')
  @UseGuards(RolesGuard)
  @Roles(Rol.PASTOR, Rol.LIDER)
  @ApiOperation({ summary: 'Agregar miembro al grupo por email' })
  agregar(@Param('id') id: string, @Body() body: { email: string }, @Request() req) {
    return this.svc.agregarMiembro(id, body.email, req.user.sub);
  }

  @Delete(':id/miembros/:userId')
  @UseGuards(RolesGuard)
  @Roles(Rol.PASTOR, Rol.LIDER)
  @ApiOperation({ summary: 'Remover miembro del grupo' })
  remover(@Param('id') id: string, @Param('userId') userId: string, @Request() req) {
    return this.svc.removerMiembro(id, userId, req.user.sub);
  }
}
