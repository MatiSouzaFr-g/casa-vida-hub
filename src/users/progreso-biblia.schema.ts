import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProgresoBibliaDocument = ProgresoBiblia & Document;

@Schema({ timestamps: true, collection: 'progreso_biblia' })
export class ProgresoBiblia {
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true, unique: true })
  usuario: Types.ObjectId;

  // Último punto de lectura
  @Prop()
  ultimoLibro: string;       // ej: "Juan"

  @Prop({ type: Number })
  ultimoCapitulo: number;    // ej: 3

  @Prop({ type: Date })
  ultimaLectura: Date;

  // Historial de marcadores guardados por el usuario
  @Prop({
    type: [{
      libro: String,
      capitulo: Number,
      nota: String,
      fecha: Date,
    }],
    default: [],
  })
  marcadores: {
    libro: string;
    capitulo: number;
    nota?: string;
    fecha: Date;
  }[];
}

export const ProgresoBibliaSchema = SchemaFactory.createForClass(ProgresoBiblia);
