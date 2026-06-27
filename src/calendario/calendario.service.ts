// ─── calendario.service.ts ───────────────────────────────────────────────
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Encuentro, EncuentroDocument } from './encuentro.schema';

@Injectable()
export class CalendarioService {
  constructor(
    @InjectModel(Encuentro.name) private encuentroModel: Model<EncuentroDocument>,
  ) {}

  async crear(grupoId: string, liderId: string, data: {
    titulo: string; descripcion?: string;
    fecha: string; ubicacion: string; urlMapa?: string;
  }) {
    return this.encuentroModel.create({
      grupo:     new Types.ObjectId(grupoId),
      creadoPor: new Types.ObjectId(liderId),
      titulo:    data.titulo,
      descripcion: data.descripcion,
      fecha:     new Date(data.fecha),
      ubicacion: data.ubicacion,
      urlMapa:   data.urlMapa,
    });
  }

  async listarPorGrupo(grupoId: string) {
    return this.encuentroModel
      .find({ grupo: new Types.ObjectId(grupoId) })
      .populate('creadoPor', 'nombre fotoPerfil')
      .sort({ fecha: 1 })
      .lean();
  }

  async proximoEncuentro(grupoId: string) {
    return this.encuentroModel
      .findOne({
        grupo: new Types.ObjectId(grupoId),
        fecha: { $gte: new Date() },
      })
      .populate('creadoPor', 'nombre fotoPerfil')
      .sort({ fecha: 1 })
      .lean();
  }

  async todosLosEncuentros() {
    return this.encuentroModel
      .find({ fecha: { $gte: new Date() } })
      .populate('grupo', 'nombre')
      .populate('creadoPor', 'nombre')
      .sort({ fecha: 1 })
      .lean();
  }

  async confirmarAsistencia(encuentroId: string, userId: string) {
    const enc = await this.encuentroModel.findById(encuentroId);
    if (!enc) throw new NotFoundException('Encuentro no encontrado');
    const uid = new Types.ObjectId(userId);
    const ya  = enc.asistentes.some((a) => a.toString() === userId);
    if (ya) {
      enc.asistentes = enc.asistentes.filter((a) => a.toString() !== userId);
    } else {
      enc.asistentes.push(uid);
    }
    await enc.save();
    return { confirmado: !ya, totalAsistentes: enc.asistentes.length };
  }

  async actualizar(encuentroId: string, liderId: string, data: any) {
    const enc = await this.encuentroModel.findById(encuentroId);
    if (!enc) throw new NotFoundException('Encuentro no encontrado');
    if (enc.creadoPor.toString() !== liderId)
      throw new ForbiddenException('Solo el líder que creó el encuentro puede editarlo');
    return this.encuentroModel.findByIdAndUpdate(encuentroId, data, { new: true });
  }

  async eliminar(encuentroId: string, liderId: string) {
    const enc = await this.encuentroModel.findById(encuentroId);
    if (!enc) throw new NotFoundException('Encuentro no encontrado');
    if (enc.creadoPor.toString() !== liderId)
      throw new ForbiddenException('Solo el líder puede eliminar este encuentro');
    await this.encuentroModel.findByIdAndDelete(encuentroId);
    return { message: 'Encuentro eliminado' };
  }
}
