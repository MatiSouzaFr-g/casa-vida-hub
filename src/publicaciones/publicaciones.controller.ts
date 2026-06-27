import {
  Controller, Get, Post, Delete, Patch,
  Body, Param, Query, Request, UseGuards,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PublicacionesService } from './publicaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TipoPublicacion, AlcancePublicacion } from './publicacion.schema';

const storage = diskStorage({
  destination: './uploads',
  filename: (_, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + extname(file.originalname));
  },
});

@ApiTags('Publicaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly svc: PublicacionesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagen', { storage }))
  @ApiOperation({ summary: 'Crear publicación (estado, instantánea o evento)' })
  crear(
    @Body() body: any,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imagenUrl = file ? `/uploads/${file.filename}` : body.imagen;
    return this.svc.crear(
      req.user.sub,
      body.tipo as TipoPublicacion,
      body.alcance as AlcancePublicacion,
      body.texto,
      imagenUrl,
      body.grupoId,
    );
  }

  @Get('iglesia')
  @ApiOperation({ summary: 'Feed global de la iglesia (módulo Casa)' })
  feedIglesia(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.svc.feedIglesia(+page, +limit);
  }

  @Get('grupo/:grupoId')
  @ApiOperation({ summary: 'Feed del grupo' })
  feedGrupo(
    @Param('grupoId') grupoId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.svc.feedGrupo(grupoId, +page, +limit);
  }

  @Get('perfil/:userId')
  @ApiOperation({ summary: 'Publicaciones de un perfil (sin instantáneas)' })
  perfil(@Param('userId') userId: string, @Query('page') page = '1') {
    return this.svc.publicacionesDePerfil(userId, +page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver publicación con comentarios' })
  verUna(@Param('id') id: string) {
    return this.svc.verUna(id);
  }

  @Patch(':id/like')
  @ApiOperation({ summary: 'Dar / quitar like' })
  like(@Param('id') id: string, @Request() req) {
    return this.svc.toggleLike(id, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar publicación' })
  eliminar(@Param('id') id: string, @Request() req) {
    return this.svc.eliminar(id, req.user.sub, req.user.rol);
  }
}
