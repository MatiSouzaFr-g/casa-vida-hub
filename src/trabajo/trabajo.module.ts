import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrabajoController } from './trabajo.controller';
import { TrabajoService } from './trabajo.service';
import { Trabajo, TrabajoSchema } from './trabajo.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Trabajo.name, schema: TrabajoSchema }])],
  controllers: [TrabajoController],
  providers: [TrabajoService],
})
export class TrabajoModule {}
