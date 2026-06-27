// ─── trabajo.service.ts ──────────────────────────────────────────────────
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Trabajo, TrabajoDocument, TipoTrabajo } from './trabajo.schema';

@Injectable()
export class TrabajoService {
  constructor(
    @InjectModel(Trabajo.name) private trabajoModel: Model<TrabajoDocument>,
  ) {}

  async crear(autorId: string, data: {
    tipo: TipoTrabajo; titulo: string; descripcion: string;
    contacto?: string; urlCv?: string; habilidades?: string[];
  }) {
    return (await this.trabajoModel.create({
      autor: new Types.ObjectId(autorId),
      ...data,
    })).populate('autor', 'nombre fotoPerfil');
  }

  async listar(tipo?: TipoTrabajo, page = 1, limit = 20) {
    const query: any = { activo: true };
    if (tipo) query.tipo = tipo;
    return this.trabajoModel
      .find(query)
      .populate('autor', 'nombre fotoPerfil bio')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }

  async verUno(id: string) {
    const t = await this.trabajoModel.findById(id).populate('autor', 'nombre fotoPerfil bio telefono');
    if (!t) throw new NotFoundException('Publicación de trabajo no encontrada');
    return t;
  }

  async actualizar(id: string, autorId: string, data: any) {
    const t = await this.trabajoModel.findById(id);
    if (!t) throw new NotFoundException('No encontrado');
    if (t.autor.toString() !== autorId) throw new ForbiddenException('No podés editar esto');
    return this.trabajoModel.findByIdAndUpdate(id, data, { new: true });
  }

  async desactivar(id: string, autorId: string, rol: string) {
    const t = await this.trabajoModel.findById(id);
    if (!t) throw new NotFoundException('No encontrado');
    if (t.autor.toString() !== autorId && rol !== 'pastor')
      throw new ForbiddenException('No podés eliminar esto');
    return this.trabajoModel.findByIdAndUpdate(id, { activo: false }, { new: true });
  }
}
