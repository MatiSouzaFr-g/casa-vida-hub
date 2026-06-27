// ─── notificaciones.service.ts ───────────────────────────────────────────
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Usuario, UsuarioDocument } from '../users/usuario.schema';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectModel(Usuario.name) private userModel: Model<UsuarioDocument>,
  ) {}

  // Guardar el Expo Push Token del dispositivo del usuario
  async registrarToken(userId: string, expoPushToken: string) {
    await this.userModel.findByIdAndUpdate(userId, { expoPushToken });
    return { message: 'Token registrado' };
  }

  // Enviar notificación push vía Expo Push API (sin SDK, con fetch nativo)
  async enviarPush(tokens: string[], titulo: string, cuerpo: string, data?: object) {
    const mensajes = tokens
      .filter((t) => t && t.startsWith('ExponentPushToken'))
      .map((to) => ({ to, title: titulo, body: cuerpo, data: data || {} }));

    if (!mensajes.length) return;

    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body:    JSON.stringify(mensajes),
      });
    } catch (e) {
      console.error('Error enviando push:', e);
    }
  }

  // Notificar a todos los miembros de un grupo
  async notificarGrupo(grupoId: string, titulo: string, cuerpo: string, data?: object) {
    const usuarios = await this.userModel
      .find({ grupo: new Types.ObjectId(grupoId), expoPushToken: { $exists: true, $ne: null } })
      .select('expoPushToken')
      .lean();
    const tokens = usuarios.map((u) => u.expoPushToken).filter(Boolean);
    await this.enviarPush(tokens, titulo, cuerpo, data);
  }

  // Notificar a todos los usuarios activos de la iglesia
  async notificarTodos(titulo: string, cuerpo: string, data?: object) {
    const usuarios = await this.userModel
      .find({ expoPushToken: { $exists: true, $ne: null } })
      .select('expoPushToken')
      .lean();
    const tokens = usuarios.map((u) => u.expoPushToken).filter(Boolean);
    await this.enviarPush(tokens, titulo, cuerpo, data);
  }
}
