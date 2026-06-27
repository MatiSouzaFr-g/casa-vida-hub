import {
  Controller, Post, Body, Patch, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsArray } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Rol } from '../users/usuario.schema';

class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}

class CompletarRegistroDto {
  @IsString() token: string;
  @IsString() nombre: string;
  @IsString() @MinLength(8) password: string;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsArray() gustos?: string[];
  @IsOptional() @IsString() fotoPerfil?: string;
}

class InvitarDto {
  @IsEmail() email: string;
  @IsOptional() @IsString() grupoId?: string;
}

class CambiarPasswordDto {
  @IsString() actual: string;
  @IsString() @MinLength(8) nueva: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('completar-registro')
  @ApiOperation({ summary: 'Completar registro desde link de invitación' })
  completar(@Body() dto: CompletarRegistroDto) {
    return this.auth.completarRegistro(
      dto.token, dto.nombre, dto.password,
      dto.telefono, dto.bio, dto.gustos, dto.fotoPerfil,
    );
  }

  @Post('invitar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.PASTOR, Rol.LIDER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invitar usuario por email (pastor o líder)' })
  invitar(@Body() dto: InvitarDto, @Request() req) {
    return this.auth.enviarInvitacion(dto.email, req.user.sub, dto.grupoId);
  }

  @Post('reenviar-invitacion')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.PASTOR, Rol.LIDER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reenviar invitación a email pendiente' })
  reenviar(@Body() body: { email: string }) {
    return this.auth.reenviarInvitacion(body.email);
  }

  @Patch('cambiar-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar contraseña' })
  cambiarPassword(@Body() dto: CambiarPasswordDto, @Request() req) {
    return this.auth.cambiarPassword(req.user.sub, dto.actual, dto.nueva);
  }
}
