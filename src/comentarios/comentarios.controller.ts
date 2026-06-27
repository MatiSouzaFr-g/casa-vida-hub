// ─── comentarios.controller.ts ───────────────────────────────────────────
import { Controller, Get, Post, Delete, Patch, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ComentariosService } from './comentarios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Comentarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comentarios')
export class ComentariosController {
  constructor(private readonly svc: ComentariosService) {}

  @Post(':pubId')
  @ApiOperation({ summary: 'Comentar una publicación' })
  crear(@Param('pubId') pubId: string, @Body() body: { texto: string }, @Request() req) {
    return this.svc.crear(pubId, req.user.sub, body.texto);
  }

  @Get(':pubId')
  @ApiOperation({ summary: 'Listar comentarios de una publicación' })
  listar(@Param('pubId') pubId: string) {
    return this.svc.listar(pubId);
  }

  @Patch(':id/like')
  @ApiOperation({ summary: 'Like / unlike a un comentario' })
  like(@Param('id') id: string, @Request() req) {
    return this.svc.toggleLike(id, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar comentario' })
  eliminar(@Param('id') id: string, @Request() req) {
    return this.svc.eliminar(id, req.user.sub, req.user.rol);
  }
}
