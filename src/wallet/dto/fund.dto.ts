import { IsNumber, IsString, IsIn, Min } from 'class-validator';

export class FundWalletDto {
  @IsNumber()
  @Min(100)
  amount: number;

  @IsString()
  @IsIn(['bank', 'card', 'ussd'])
  method: 'bank' | 'card' | 'ussd';

  @IsString()
  @IsIn(['NGN', 'USD'])
  currency: 'NGN' | 'USD';
}

export class WithdrawDto {
  @IsNumber()
  @Min(100)
  amount: number;

  @IsString()
  linkedAccountId: string;

  @IsString()
  @IsIn(['NGN', 'USD'])
  currency: 'NGN' | 'USD';
}

export class AddLinkedAccountDto {
  @IsString()
  @IsIn(['bank', 'card'])
  type: 'bank' | 'card';

  @IsString()
  name: string;

  @IsString()
  last4: string;

  @IsString()
  meta: string;
}
