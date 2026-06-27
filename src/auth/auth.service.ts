import {
  Injectable, UnauthorizedException, BadRequestException, NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { Usuario, UsuarioDocument, EstadoUsuario } from '../users/usuario.schema';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(Usuario.name) private userModel: Model<UsuarioDocument>,
    private jwt: JwtService,
    private cfg: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.cfg.get('MAIL_HOST'),
      port: this.cfg.get<number>('MAIL_PORT'),
      secure: false,
      auth: { user: this.cfg.get('MAIL_USER'), pass: this.cfg.get('MAIL_PASS') },
    });
  }

  // ── Login ────────────────────────────────────────────────────────────────
  async login(email: string, password: string) {
    const user = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('grupo', 'nombre');

    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    if (user.estado === EstadoUsuario.PENDIENTE)
      throw new UnauthorizedException('Completá tu registro con el link que te enviamos por email');
    if (user.estado === EstadoUsuario.INACTIVO)
      throw new UnauthorizedException('Tu cuenta está inactiva. Contactá al pastor');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    const token = this.jwt.sign({
      sub:    user._id,
      email:  user.email,
      rol:    user.rol,
      grupoId: user.grupo?.toString() ?? null,
    });

    return {
      token,
      usuario: {
        id:        user._id,
        nombre:    user.nombre,
        email:     user.email,
        fotoPerfil: user.fotoPerfil,
        rol:       user.rol,
        grupo:     user.grupo,
      },
    };
  }

  // ── Completar registro (desde el link del email) ─────────────────────────
  async completarRegistro(
    token: string,
    nombre: string,
    password: string,
    telefono?: string,
    bio?: string,
    gustos?: string[],
    fotoPerfil?: string,
  ) {
    const user = await this.userModel
      .findOne({ tokenInvitacion: token })
      .select('+tokenInvitacion +tokenExpira');

    if (!user) throw new NotFoundException('El link es inválido o ya fue utilizado');
    if (user.tokenExpira < new Date())
      throw new BadRequestException('El link expiró. Pedile a tu líder que te reenvíe la invitación');

    const hash = await bcrypt.hash(password, 12);
    user.nombre          = nombre;
    user.password        = hash;
    user.telefono        = telefono;
    user.bio             = bio;
    user.gustos          = gustos ?? [];
    user.fotoPerfil      = fotoPerfil;
    user.estado          = EstadoUsuario.ACTIVO;
    user.tokenInvitacion = null;
    user.tokenExpira     = null;
    await user.save();

    return { message: '¡Bienvenido a Kingdom Hub! Ya podés iniciar sesión.' };
  }

  // ── Enviar invitación por email ──────────────────────────────────────────
  async enviarInvitacion(email: string, creadoPorId: string, grupoId?: string) {
    const existe = await this.userModel.findOne({ email: email.toLowerCase() });
    if (existe) throw new BadRequestException('Ya existe un usuario con ese email');

    const token   = uuidv4();
    const expira  = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hs

    await this.userModel.create({
      email:           email.toLowerCase(),
      tokenInvitacion: token,
      tokenExpira:     expira,
      creadoPor:       creadoPorId,
      grupo:           grupoId || null,
    });

    const link = `${this.cfg.get('INVITATION_BASE_URL')}/${token}`;

    await this.transporter.sendMail({
      from:    this.cfg.get('MAIL_FROM'),
      to:      email,
      subject: '¡Fuiste invitado a Kingdom Hub!',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px">
          <h2 style="color:#6366f1">🏛️ Kingdom Hub</h2>
          <p>¡Hola! Fuiste invitado a ser parte de la comunidad de Kingdom Hub.</p>
          <p>Hacé clic en el botón para completar tu registro:</p>
          <a href="${link}"
             style="display:inline-block;background:#6366f1;color:white;
                    padding:14px 28px;border-radius:8px;text-decoration:none;
                    font-weight:bold;margin:16px 0">
            Completar registro
          </a>
          <p style="color:#64748b;font-size:13px">
            Este link es válido por 72 horas.<br>
            Si no esperabas esta invitación, podés ignorar este correo.
          </p>
        </div>
      `,
    });

    return { message: `Invitación enviada a ${email}` };
  }

  // ── Reenviar invitación ──────────────────────────────────────────────────
  async reenviarInvitacion(email: string) {
    const user = await this.userModel
      .findOne({ email: email.toLowerCase(), estado: EstadoUsuario.PENDIENTE })
      .select('+tokenInvitacion +tokenExpira');

    if (!user) throw new NotFoundException('No se encontró una invitación pendiente para ese email');

    const token  = uuidv4();
    const expira = new Date(Date.now() + 72 * 60 * 60 * 1000);
    user.tokenInvitacion = token;
    user.tokenExpira     = expira;
    await user.save();

    const link = `${this.cfg.get('INVITATION_BASE_URL')}/${token}`;
    await this.transporter.sendMail({
      from:    this.cfg.get('MAIL_FROM'),
      to:      email,
      subject: 'Tu nueva invitación a Kingdom Hub',
      html: `<p>Nuevo link de registro: <a href="${link}">${link}</a></p>`,
    });

    return { message: 'Invitación reenviada' };
  }

  // ── Cambiar contraseña ───────────────────────────────────────────────────
  async cambiarPassword(userId: string, actual: string, nueva: string) {
    const user = await this.userModel.findById(userId).select('+password');
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const ok = await bcrypt.compare(actual, user.password);
    if (!ok) throw new UnauthorizedException('La contraseña actual es incorrecta');
    user.password = await bcrypt.hash(nueva, 12);
    await user.save();
    return { message: 'Contraseña actualizada' };
  }
}
