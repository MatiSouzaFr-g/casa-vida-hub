// ─── trabajo.controller.ts ───────────────────────────────────────────────
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TrabajoService } from './trabajo.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TipoTrabajo } from './trabajo.schema';

@ApiTags('Trabajo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trabajo')
export class TrabajoController {
  constructor(private readonly svc: TrabajoService) {}

  @Post()
  @ApiOperation({ summary: 'Publicar oferta o búsqueda de empleo' })
  crear(@Body() body: any, @Request() req) {
    return this.svc.crear(req.user.sub, body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar publicaciones de trabajo' })
  listar(@Query('tipo') tipo?: TipoTrabajo, @Query('page') page = '1') {
    return this.svc.listar(tipo, +page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver publicación de trabajo' })
  verUno(@Param('id') id: string) {
    return this.svc.verUno(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar publicación de trabajo' })
  actualizar(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.svc.actualizar(id, req.user.sub, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar publicación de trabajo' })
  desactivar(@Param('id') id: string, @Request() req) {
    return this.svc.desactivar(id, req.user.sub, req.user.rol);
  }
}
