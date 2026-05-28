import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SubmitPhoneDto, VerifyOtpDto } from './dto/kyc.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('kyc/phone')
  submitPhone(@Request() req, @Body() dto: SubmitPhoneDto) {
    return this.authService.submitPhone(req.user.id, dto.phone);
  }

  @UseGuards(JwtAuthGuard)
  @Post('kyc/otp')
  verifyOtp(@Request() req, @Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(req.user.id, dto.otp);
  }

  @UseGuards(JwtAuthGuard)
  @Post('kyc/email')
  verifyEmail(@Request() req) {
    return this.authService.verifyEmail(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('kyc/selfie')
  completeSelfie(@Request() req) {
    return this.authService.completeSelfie(req.user.id);
  }
}
