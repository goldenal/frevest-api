import { Controller, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InMemoryStore } from '../store/in-memory.store';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

class UpdatePreferencesDto {
  @IsBoolean()
  @IsOptional()
  biometricEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  emailDigests?: boolean;
}

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private store: InMemoryStore) {}

  @Get('me')
  getMe(@Request() req) {
    const user = this.store.findUserById(req.user.id);
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return rest;
  }

  @Patch('me')
  updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    const user = this.store.updateUser(req.user.id, dto);
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return rest;
  }

  @Patch('me/preferences')
  updatePreferences(@Request() req, @Body() dto: UpdatePreferencesDto) {
    const user = this.store.updateUser(req.user.id, dto);
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
