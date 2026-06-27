import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CalendarioService } from './calendario.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Rol } from '../users/usuario.schema';

@ApiTags('Calendario')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('calendario')
export class CalendarioController {
  constructor(private readonly svc: CalendarioService) {}

  @Post('grupos/:grupoId')
  @UseGuards(RolesGuard)
  @Roles(Rol.PASTOR, Rol.LIDER)
  @ApiOperation({ summary: 'Crear encuentro de grupo' })
  crear(@Param('grupoId') grupoId: string, @Body() body: any, @Request() req) {
    return this.svc.crear(grupoId, req.user.sub, body);
  }

  @Get('grupos/:grupoId')
  @ApiOperation({ summary: 'Listar encuentros de un grupo' })
  listar(@Param('grupoId') grupoId: string) {
    return this.svc.listarPorGrupo(grupoId);
  }

  @Get('grupos/:grupoId/proximo')
  @ApiOperation({ summary: 'Próximo encuentro del grupo' })
  proximo(@Param('grupoId') grupoId: string) {
    return this.svc.proximoEncuentro(grupoId);
  }

  @Get('todos')
  @UseGuards(RolesGuard)
  @Roles(Rol.PASTOR)
  @ApiOperation({ summary: 'Todos los encuentros (pastor)' })
  todos() {
    return this.svc.todosLosEncuentros();
  }

  @Patch(':id/asistencia')
  @ApiOperation({ summary: 'Confirmar / cancelar asistencia' })
  asistencia(@Param('id') id: string, @Request() req) {
    return this.svc.confirmarAsistencia(id, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Rol.PASTOR, Rol.LIDER)
  @ApiOperation({ summary: 'Actualizar encuentro' })
  actualizar(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.svc.actualizar(id, req.user.sub, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Rol.PASTOR, Rol.LIDER)
  @ApiOperation({ summary: 'Eliminar encuentro' })
  eliminar(@Param('id') id: string, @Request() req) {
    return this.svc.eliminar(id, req.user.sub);
  }
}
