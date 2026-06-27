// comentarios.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario, ComentarioDocument } from './comentario.schema';
import { Publicacion, PublicacionDocument } from '../publicaciones/publicacion.schema';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name)  private comModel: Model<ComentarioDocument>,
    @InjectModel(Publicacion.name) private pubModel: Model<PublicacionDocument>,
  ) {}

  async crear(pubId: string, autorId: string, texto: string) {
    const pub = await this.pubModel.findById(pubId);
    if (!pub) throw new NotFoundException('Publicación no encontrada');

    const comentario = await this.comModel.create({
      publicacion: new Types.ObjectId(pubId),
      autor:       new Types.ObjectId(autorId),
      texto,
    });

    // Incrementar contador desnormalizado
    await this.pubModel.findByIdAndUpdate(pubId, { $inc: { cantidadComentarios: 1 } });

    return comentario.populate('autor', 'nombre fotoPerfil');
  }

  async listar(pubId: string) {
    return this.comModel
      .find({ publicacion: new Types.ObjectId(pubId) })
      .populate('autor', 'nombre fotoPerfil')
      .sort({ createdAt: 1 })
      .lean();
  }

  async toggleLike(comId: string, userId: string) {
    const com = await this.comModel.findById(comId);
    if (!com) throw new NotFoundException('Comentario no encontrado');
    const uid = new Types.ObjectId(userId);
    const yaDio = com.likes.some((l) => l.toString() === userId);
    if (yaDio) {
      com.likes = com.likes.filter((l) => l.toString() !== userId);
    } else {
      com.likes.push(uid);
    }
    await com.save();
    return { likes: com.likes.length, likeDado: !yaDio };
  }

  async eliminar(comId: string, userId: string, rol: string) {
    const com = await this.comModel.findById(comId);
    if (!com) throw new NotFoundException('Comentario no encontrado');
    if (com.autor.toString() !== userId && rol !== 'pastor')
      throw new ForbiddenException('No podés eliminar este comentario');
    await this.comModel.findByIdAndDelete(comId);
    await this.pubModel.findByIdAndUpdate(com.publicacion, {
      $inc: { cantidadComentarios: -1 },
    });
    return { message: 'Comentario eliminado' };
  }
}
