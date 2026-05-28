import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InMemoryStore } from '../store/in-memory.store';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private store: InMemoryStore,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = this.store.findUserByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.store.createUser({
      name: dto.name,
      email: dto.email,
      passwordHash,
      phone: dto.phone || '',
      tier: 1,
      kycStatus: 'none',
      walletNgn: 0,
      walletUsd: 0,
      biometricEnabled: false,
      pushNotifications: true,
      emailDigests: false,
      createdAt: new Date().toISOString().split('T')[0],
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { accessToken: token, user: this.sanitize(user) };
  }

  async login(dto: LoginDto) {
    const user = this.store.findUserByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { accessToken: token, user: this.sanitize(user) };
  }

  async submitPhone(userId: string, phone: string) {
    this.store.updateUser(userId, { phone, kycStatus: 'pending' });
    // In a real app: send SMS OTP. Here we simulate it.
    return { message: 'OTP sent to ' + phone, otpHint: '123456' };
  }

  async verifyOtp(userId: string, otp: string) {
    // Accept any 6-digit code in test mode; real code would validate against stored OTP
    if (otp.length !== 6) throw new BadRequestException('Invalid OTP format');
    return { message: 'Phone verified successfully' };
  }

  async verifyEmail(userId: string) {
    // Simulate email verification
    return { message: 'Email verification link sent' };
  }

  async completeSelfie(userId: string) {
    this.store.updateUser(userId, { kycStatus: 'verified', tier: 1 });
    const user = this.store.findUserById(userId);
    return { message: 'KYC complete', user: this.sanitize(user!) };
  }

  private sanitize(user: ReturnType<InMemoryStore['findUserById']>) {
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
