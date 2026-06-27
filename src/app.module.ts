import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GruposModule } from './grupos/grupos.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { CalendarioModule } from './calendario/calendario.module';
import { TrabajoModule } from './trabajo/trabajo.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        uri: cfg.get<string>('MONGODB_URI'),
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    EventEmitterModule.forRoot(),
    AuthModule,
    UsersModule,
    GruposModule,
    PublicacionesModule,
    ComentariosModule,
    CalendarioModule,
    TrabajoModule,
    NotificacionesModule,
  ],
})
export class AppModule {}
