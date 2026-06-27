import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PublicacionDocument = Publicacion & Document;

export enum TipoPublicacion {
  ESTADO      = 'estado',       // texto libre
  INSTANTANEA = 'instantanea',  // foto del momento, no queda en perfil
  EVENTO      = 'evento',       // actividad de la iglesia
}

export enum AlcancePublicacion {
  IGLESIA = 'iglesia',  // visible para todos (módulo Casa)
  GRUPO   = 'grupo',    // visible solo en el grupo
}

@Schema({ timestamps: true, collection: 'publicaciones' })
export class Publicacion {
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  autor: Types.ObjectId;

  @Prop({ type: String, enum: TipoPublicacion, required: true })
  tipo: TipoPublicacion;

  @Prop({ type: String, enum: AlcancePublicacion, required: true })
  alcance: AlcancePublicacion;

  // Si el alcance es 'grupo', a qué grupo pertenece
  @Prop({ type: Types.ObjectId, ref: 'Grupo' })
  grupo: Types.ObjectId;

  @Prop({ trim: true })
  texto: string;

  // URL de imagen (subida al servidor o cloudinary)
  @Prop()
  imagen: string;

  // Likes: array de IDs de usuarios que dieron like
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Usuario' }], default: [] })
  likes: Types.ObjectId[];

  // Cantidad de comentarios (desnormalizado para rendimiento)
  @Prop({ default: 0 })
  cantidadComentarios: number;

  // Las instantáneas expiran a las 24 hs
  @Prop({ type: Date })
  expiraEn: Date;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
PublicacionSchema.index({ alcance: 1, createdAt: -1 });
PublicacionSchema.index({ grupo: 1, createdAt: -1 });
PublicacionSchema.index({ autor: 1, tipo: 1 });
// TTL index: borra automáticamente las instantáneas vencidas
PublicacionSchema.index({ expiraEn: 1 }, { expireAfterSeconds: 0, sparse: true });
