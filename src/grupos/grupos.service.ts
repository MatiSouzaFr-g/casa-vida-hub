// ─── grupos.service.ts ────────────────────────────────────────────────────
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Grupo, GrupoDocument } from './grupo.schema';
import { Usuario, UsuarioDocument } from '../users/usuario.schema';

@Injectable()
export class GruposService {
  constructor(
    @InjectModel(Grupo.name)   private grupoModel: Model<GrupoDocument>,
    @InjectModel(Usuario.name) private userModel:  Model<UsuarioDocument>,
  ) {}

  async crear(nombre: string, descripcion: string, foto: string, liderId: string) {
    const grupo = await this.grupoModel.create({
      nombre, descripcion, foto,
      lider: new Types.ObjectId(liderId),
    });
    // Asignar el líder a su propio grupo
    await this.userModel.findByIdAndUpdate(liderId, { grupo: grupo._id });
    return grupo;
  }

  async listarTodos() {
    return this.grupoModel
      .find({ activo: true })
      .populate('lider', 'nombre fotoPerfil email')
      .lean();
  }

  async verUno(grupoId: string) {
    const g = await this.grupoModel
      .findById(grupoId)
      .populate('lider', 'nombre fotoPerfil email');
    if (!g) throw new NotFoundException('Grupo no encontrado');
    const miembros = await this.userModel
      .find({ grupo: new Types.ObjectId(grupoId) })
      .select('nombre fotoPerfil bio gustos rol')
      .lean();
    return { ...g.toObject(), miembros };
  }

  async actualizar(grupoId: string, data: any, liderId: string) {
    const g = await this.grupoModel.findById(grupoId);
    if (!g) throw new NotFoundException('Grupo no encontrado');
    if (g.lider.toString() !== liderId)
      throw new ForbiddenException('Solo el líder del grupo puede editarlo');
    return this.grupoModel.findByIdAndUpdate(grupoId, data, { new: true });
  }

  // El líder agrega un discípulo por email
  async agregarMiembro(grupoId: string, email: string, liderId: string) {
    const g = await this.grupoModel.findById(grupoId);
    if (!g) throw new NotFoundException('Grupo no encontrado');
    if (g.lider.toString() !== liderId)
      throw new ForbiddenException('Solo el líder puede agregar miembros');

    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) throw new NotFoundException('Usuario no encontrado con ese email');

    user.grupo = new Types.ObjectId(grupoId);
    await user.save();
    return { message: `${user.nombre || user.email} agregado al grupo` };
  }

  async removerMiembro(grupoId: string, userId: string, liderId: string) {
    const g = await this.grupoModel.findById(grupoId);
    if (!g) throw new NotFoundException('Grupo no encontrado');
    if (g.lider.toString() !== liderId)
      throw new ForbiddenException('Solo el líder puede remover miembros');
    await this.userModel.findByIdAndUpdate(userId, { $unset: { grupo: 1 } });
    return { message: 'Miembro removido del grupo' };
  }

  async miGrupo(grupoId: string) {
    return this.verUno(grupoId);
  }
}
