import {
  Controller, Get, Patch, Post, Delete,
  Body, Param, Query, Request, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Rol } from './usuario.schema';

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Mi perfil' })
  miPerfil(@Request() req) {
    return this.svc.miPerfil(req.user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar mi perfil' })
  actualizar(@Request() req, @Body() body: any) {
    return this.svc.actualizarPerfil(req.user.sub, body);
  }

  @Get('grupo/:grupoId')
  @ApiOperation({ summary: 'Miembros de un grupo' })
  miembros(@Param('grupoId') grupoId: string) {
    return this.svc.usuariosDelGrupo(grupoId);
  }

  @Get('todos')
  @UseGuards(RolesGuard)
  @Roles(Rol.PASTOR)
  @ApiOperation({ summary: 'Listar todos los usuarios (pastor)' })
  todos(@Query('rol') rol?: string) {
    return this.svc.listarTodos(rol);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver perfil de otro usuario' })
  verPerfil(@Param('id') id: string) {
    return this.svc.verPerfil(id);
  }

  @Patch(':id/desactivar')
  @UseGuards(RolesGuard)
  @Roles(Rol.PASTOR)
  @ApiOperation({ summary: 'Desactivar usuario (pastor)' })
  desactivar(@Param('id') id: string) {
    return this.svc.desactivar(id);
  }

  // ── Biblia ──────────────────────────────────────────────────────────────
  @Get('me/biblia/progreso')
  @ApiOperation({ summary: 'Ver mi progreso de lectura bíblica' })
  progreso(@Request() req) {
    return this.svc.getProgresoBiblia(req.user.sub);
  }

  @Patch('me/biblia/progreso')
  @ApiOperation({ summary: 'Guardar progreso de lectura' })
  guardarProgreso(@Request() req, @Body() body: { libro: string; capitulo: number }) {
    return this.svc.guardarProgresoBiblia(req.user.sub, body.libro, body.capitulo);
  }

  @Post('me/biblia/marcadores')
  @ApiOperation({ summary: 'Agregar marcador bíblico' })
  agregarMarcador(@Request() req, @Body() body: { libro: string; capitulo: number; nota?: string }) {
    return this.svc.agregarMarcador(req.user.sub, body.libro, body.capitulo, body.nota);
  }

  @Delete('me/biblia/marcadores/:id')
  @ApiOperation({ summary: 'Eliminar marcador bíblico' })
  eliminarMarcador(@Request() req, @Param('id') id: string) {
    return this.svc.eliminarMarcador(req.user.sub, id);
  }
}
