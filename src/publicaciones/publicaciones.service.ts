import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Publicacion, PublicacionDocument,
  TipoPublicacion, AlcancePublicacion,
} from './publicacion.schema';
import { Comentario, ComentarioDocument } from '../comentarios/comentario.schema';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private pubModel:  Model<PublicacionDocument>,
    @InjectModel(Comentario.name)  private comModel:  Model<ComentarioDocument>,
  ) {}

  // ── Crear publicación ────────────────────────────────────────────────────
  async crear(
    autorId: string,
    tipo: TipoPublicacion,
    alcance: AlcancePublicacion,
    texto: string,
    imagen: string,
    grupoId?: string,
  ) {
    const data: any = {
      autor:   new Types.ObjectId(autorId),
      tipo,
      alcance,
      texto,
      imagen,
    };

    if (alcance === AlcancePublicacion.GRUPO && grupoId) {
      data.grupo = new Types.ObjectId(grupoId);
    }

    // Las instantáneas expiran en 24 horas
    if (tipo === TipoPublicacion.INSTANTANEA) {
      data.expiraEn = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    return (await this.pubModel.create(data)).populate('autor', 'nombre fotoPerfil');
  }

  // ── Feed iglesia (módulo Casa) ───────────────────────────────────────────
  async feedIglesia(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.pubModel
      .find({ alcance: AlcancePublicacion.IGLESIA })
      .populate('autor', 'nombre fotoPerfil rol')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  // ── Feed de un grupo ─────────────────────────────────────────────────────
  async feedGrupo(grupoId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.pubModel
      .find({ grupo: new Types.ObjectId(grupoId) })
      .populate('autor', 'nombre fotoPerfil rol')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  // ── Ver una publicación con sus comentarios ──────────────────────────────
  async verUna(pubId: string) {
    const pub = await this.pubModel
      .findById(pubId)
      .populate('autor', 'nombre fotoPerfil rol')
      .lean();
    if (!pub) throw new NotFoundException('Publicación no encontrada');

    const comentarios = await this.comModel
      .find({ publicacion: new Types.ObjectId(pubId) })
      .populate('autor', 'nombre fotoPerfil')
      .sort({ createdAt: 1 })
      .lean();

    return { ...pub, comentarios };
  }

  // ── Like / Unlike ────────────────────────────────────────────────────────
  async toggleLike(pubId: string, userId: string) {
    const pub = await this.pubModel.findById(pubId);
    if (!pub) throw new NotFoundException('Publicación no encontrada');

    const uid  = new Types.ObjectId(userId);
    const yaDio = pub.likes.some((l) => l.toString() === userId);

    if (yaDio) {
      pub.likes = pub.likes.filter((l) => l.toString() !== userId);
    } else {
      pub.likes.push(uid);
    }
    await pub.save();
    return { likes: pub.likes.length, likeDado: !yaDio };
  }

  // ── Eliminar (autor o pastor) ────────────────────────────────────────────
  async eliminar(pubId: string, userId: string, rol: string) {
    const pub = await this.pubModel.findById(pubId);
    if (!pub) throw new NotFoundException('Publicación no encontrada');
    if (pub.autor.toString() !== userId && rol !== 'pastor')
      throw new ForbiddenException('No podés eliminar esta publicación');
    await this.pubModel.findByIdAndDelete(pubId);
    await this.comModel.deleteMany({ publicacion: new Types.ObjectId(pubId) });
    return { message: 'Publicación eliminada' };
  }

  // ── Publicaciones del perfil (solo estados y eventos, no instantáneas) ───
  async publicacionesDePerfil(userId: string, page = 1, limit = 12) {
    const skip = (page - 1) * limit;
    return this.pubModel
      .find({
        autor: new Types.ObjectId(userId),
        tipo: { $ne: TipoPublicacion.INSTANTANEA },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }
}
