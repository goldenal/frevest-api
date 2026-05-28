import { IsString, IsOptional } from 'class-validator';

export class SubmitPhoneDto {
  @IsString()
  phone: string;
}

export class VerifyOtpDto {
  @IsString()
  otp: string;
}

export class VerifyEmailDto {
  @IsString()
  token: string;
}
