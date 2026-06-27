// ─── notificaciones.controller.ts ───────────────────────────────────────
import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Rol } from '../users/usuario.schema';

@ApiTags('Notificaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly svc: NotificacionesService) {}

  @Post('token')
  @ApiOperation({ summary: 'Registrar Expo Push Token del dispositivo' })
  registrar(@Body() body: { expoPushToken: string }, @Request() req) {
    return this.svc.registrarToken(req.user.sub, body.expoPushToken);
  }

  @Post('grupo/:grupoId')
  @UseGuards(RolesGuard)
  @Roles(Rol.PASTOR, Rol.LIDER)
  @ApiOperation({ summary: 'Notificar a todo un grupo (líder/pastor)' })
  grupo(@Body() body: { titulo: string; cuerpo: string }, @Request() req) {
    return this.svc.notificarGrupo(req.params?.grupoId, body.titulo, body.cuerpo);
  }

  @Post('iglesia')
  @UseGuards(RolesGuard)
  @Roles(Rol.PASTOR)
  @ApiOperation({ summary: 'Notificar a toda la iglesia (pastor)' })
  iglesia(@Body() body: { titulo: string; cuerpo: string }) {
    return this.svc.notificarTodos(body.titulo, body.cuerpo);
  }
}
