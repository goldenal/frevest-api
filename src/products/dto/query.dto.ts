import { IsString, IsOptional, IsIn } from 'class-validator';

export class ProductQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  cat?: string;

  @IsString()
  @IsOptional()
  @IsIn(['apy', 'risk', 'min'])
  sort?: 'apy' | 'risk' | 'min';

  @IsString()
  @IsOptional()
  @IsIn(['NGN', 'USD'])
  currency?: 'NGN' | 'USD';
}
