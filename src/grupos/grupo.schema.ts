import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GrupoDocument = Grupo & Document;

@Schema({ timestamps: true, collection: 'grupos' })
export class Grupo {
  @Prop({ required: true, trim: true })
  nombre: string;              // ej: "Grupo 6"

  @Prop()
  descripcion: string;

  @Prop()
  foto: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  lider: Types.ObjectId;

  @Prop({ default: true })
  activo: boolean;
}

export const GrupoSchema = SchemaFactory.createForClass(Grupo);
