import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TrabajoDocument = Trabajo & Document;

export enum TipoTrabajo {
  OFERTA   = 'oferta',    // empresa/persona ofrece empleo
  BUSQUEDA = 'busqueda',  // persona busca trabajo
}

@Schema({ timestamps: true, collection: 'trabajos' })
export class Trabajo {
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  autor: Types.ObjectId;

  @Prop({ type: String, enum: TipoTrabajo, required: true })
  tipo: TipoTrabajo;

  @Prop({ required: true, trim: true })
  titulo: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop()
  contacto: string;         // email o teléfono de contacto

  @Prop()
  urlCv: string;            // link al CV (solo para busqueda)

  @Prop([String])
  habilidades: string[];

  @Prop({ default: true })
  activo: boolean;
}

export const TrabajoSchema = SchemaFactory.createForClass(Trabajo);
TrabajoSchema.index({ tipo: 1, activo: 1, createdAt: -1 });
