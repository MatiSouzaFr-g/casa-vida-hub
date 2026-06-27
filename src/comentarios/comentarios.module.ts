import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ComentariosController } from './comentarios.controller';
import { ComentariosService } from './comentarios.service';
import { Comentario, ComentarioSchema } from './comentario.schema';
import { Publicacion, PublicacionSchema } from '../publicaciones/publicacion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comentario.name,  schema: ComentarioSchema },
      { name: Publicacion.name, schema: PublicacionSchema },
    ]),
  ],
  controllers: [ComentariosController],
  providers: [ComentariosService],
})
export class ComentariosModule {}
