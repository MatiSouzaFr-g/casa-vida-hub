// users.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Usuario, UsuarioDocument, EstadoUsuario, Rol } from './usuario.schema';
import { ProgresoBiblia, ProgresoBibliaDocument } from './progreso-biblia.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Usuario.name)  private userModel:  Model<UsuarioDocument>,
    @InjectModel(ProgresoBiblia.name) private progresoModel: Model<ProgresoBibliaDocument>,
  ) {}

  // ── Perfil propio ────────────────────────────────────────────────────────
  async miPerfil(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('grupo', 'nombre foto')
      .lean();
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  // ── Actualizar perfil ────────────────────────────────────────────────────
  async actualizarPerfil(userId: string, data: Partial<Pick<Usuario, 'nombre' | 'telefono' | 'bio' | 'gustos' | 'fotoPerfil' | 'expoPushToken'>>) {
    return this.userModel
      .findByIdAndUpdate(userId, data, { new: true })
      .populate('grupo', 'nombre');
  }

  // ── Ver perfil de otro usuario ───────────────────────────────────────────
  async verPerfil(targetId: string) {
    const user = await this.userModel
      .findById(targetId, '-tokenInvitacion -tokenExpira')
      .populate('grupo', 'nombre foto')
      .lean();
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  // ── Listar usuarios de un grupo ──────────────────────────────────────────
  async usuariosDelGrupo(grupoId: string) {
    return this.userModel
      .find({ grupo: new Types.ObjectId(grupoId), estado: EstadoUsuario.ACTIVO })
      .select('nombre fotoPerfil bio gustos rol')
      .lean();
  }

  // ── Listar todos (solo pastor) ───────────────────────────────────────────
  async listarTodos(rol?: string) {
    const query: any = {};
    if (rol) query.rol = rol;
    return this.userModel
      .find(query)
      .select('nombre email fotoPerfil rol estado grupo creadoEn')
      .populate('grupo', 'nombre')
      .lean();
  }

  // ── Desactivar usuario (pastor) ──────────────────────────────────────────
  async desactivar(userId: string) {
    return this.userModel.findByIdAndUpdate(userId, { estado: EstadoUsuario.INACTIVO }, { new: true });
  }

  // ── Progreso Biblia ──────────────────────────────────────────────────────
  async getProgresoBiblia(userId: string) {
    return this.progresoModel.findOne({ usuario: new Types.ObjectId(userId) });
  }

  async guardarProgresoBiblia(userId: string, libro: string, capitulo: number) {
    return this.progresoModel.findOneAndUpdate(
      { usuario: new Types.ObjectId(userId) },
      { ultimoLibro: libro, ultimoCapitulo: capitulo, ultimaLectura: new Date() },
      { upsert: true, new: true },
    );
  }

  async agregarMarcador(userId: string, libro: string, capitulo: number, nota?: string) {
    return this.progresoModel.findOneAndUpdate(
      { usuario: new Types.ObjectId(userId) },
      {
        $push: {
          marcadores: { libro, capitulo, nota, fecha: new Date() },
        },
      },
      { upsert: true, new: true },
    );
  }

  async eliminarMarcador(userId: string, marcadorId: string) {
    return this.progresoModel.findOneAndUpdate(
      { usuario: new Types.ObjectId(userId) },
      { $pull: { marcadores: { _id: new Types.ObjectId(marcadorId) } } },
      { new: true },
    );
  }
}
