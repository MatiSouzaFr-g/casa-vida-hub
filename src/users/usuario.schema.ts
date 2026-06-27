import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UsuarioDocument = Usuario & Document;

export enum Rol {
  PASTOR    = 'pastor',
  LIDER     = 'lider',
  DISCIPULO = 'discipulo',
}

export enum EstadoUsuario {
  PENDIENTE = 'pendiente',   // invitado, sin contraseña aún
  ACTIVO    = 'activo',
  INACTIVO  = 'inactivo',
}

@Schema({ timestamps: true, collection: 'usuarios' })
export class Usuario {
  @Prop({ trim: true })
  nombre: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ select: false })
  password: string;

  @Prop({ trim: true })
  telefono: string;

  @Prop()
  fotoPerfil: string;

  @Prop()
  bio: string;

  @Prop([String])
  gustos: string[];           // intereses personales visibles en el perfil

  @Prop({ type: String, enum: Rol, default: Rol.DISCIPULO })
  rol: Rol;

  @Prop({ type: String, enum: EstadoUsuario, default: EstadoUsuario.PENDIENTE })
  estado: EstadoUsuario;

  // Grupo al que pertenece (asignado por el líder)
  @Prop({ type: Types.ObjectId, ref: 'Grupo' })
  grupo: Types.ObjectId;

  // Líder que lo registró
  @Prop({ type: Types.ObjectId, ref: 'Usuario' })
  creadoPor: Types.ObjectId;

  // Token para completar el registro
  @Prop({ select: false })
  tokenInvitacion: string;

  @Prop({ type: Date })
  tokenExpira: Date;

  // Push notification token (Expo)
  @Prop()
  expoPushToken: string;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
UsuarioSchema.index({ grupo: 1 });
UsuarioSchema.index({ rol: 1 });
