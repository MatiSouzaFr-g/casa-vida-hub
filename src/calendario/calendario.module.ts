import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CalendarioController } from './calendario.controller';
import { CalendarioService } from './calendario.service';
import { Encuentro, EncuentroSchema } from './encuentro.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Encuentro.name, schema: EncuentroSchema }]),
  ],
  controllers: [CalendarioController],
  providers: [CalendarioService],
})
export class CalendarioModule {}
