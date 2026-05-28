import { IsString, IsNumber, IsIn, Min } from 'class-validator';

export class CreateGoalDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  target: number;

  @IsNumber()
  @Min(0)
  current: number;

  @IsString()
  @IsIn(['NGN', 'USD'])
  currency: 'NGN' | 'USD';

  @IsString()
  cat: string;
}

export class UpdateGoalDto {
  @IsNumber()
  @Min(0)
  current: number;
}
