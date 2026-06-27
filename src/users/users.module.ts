import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Usuario, UsuarioSchema } from './usuario.schema';
import { ProgresoBiblia, ProgresoBibliaSchema } from './progreso-biblia.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Usuario.name,       schema: UsuarioSchema },
      { name: ProgresoBiblia.name, schema: ProgresoBibliaSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}
