import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EncuentroDocument = Encuentro & Document;

@Schema({ timestamps: true, collection: 'encuentros' })
export class Encuentro {
  @Prop({ type: Types.ObjectId, ref: 'Grupo', required: true })
  grupo: Types.ObjectId;

  @Prop({ required: true })
  titulo: string;             // ej: "Encuentro de Conexión #12"

  @Prop()
  descripcion: string;

  @Prop({ type: Date, required: true })
  fecha: Date;               // fecha y hora del encuentro

  @Prop({ required: true })
  ubicacion: string;         // dirección o nombre del lugar

  @Prop()
  urlMapa: string;           // link a Google Maps

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  creadoPor: Types.ObjectId;  // líder que lo registró

  // Confirmaciones de asistencia
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Usuario' }], default: [] })
  asistentes: Types.ObjectId[];
}

export const EncuentroSchema = SchemaFactory.createForClass(Encuentro);
EncuentroSchema.index({ grupo: 1, fecha: 1 });
