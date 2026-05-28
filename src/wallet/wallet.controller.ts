import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { FundWalletDto, WithdrawDto, AddLinkedAccountDto } from './dto/fund.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsNumber, IsString, IsIn, Min } from 'class-validator';

class InvestDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsIn(['NGN', 'USD'])
  currency: 'NGN' | 'USD';
}

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('balance')
  getBalance(@Request() req) {
    return this.walletService.getBalance(req.user.id);
  }

  @Get('linked-accounts')
  getLinkedAccounts(@Request() req) {
    return this.walletService.getLinkedAccounts(req.user.id);
  }

  @Post('linked-accounts')
  addLinkedAccount(@Request() req, @Body() dto: AddLinkedAccountDto) {
    return this.walletService.addLinkedAccount(req.user.id, dto);
  }

  @Delete('linked-accounts/:id')
  removeLinkedAccount(@Request() req, @Param('id') id: string) {
    return this.walletService.removeLinkedAccount(req.user.id, id);
  }

  @Post('fund')
  fund(@Request() req, @Body() dto: FundWalletDto) {
    return this.walletService.fund(req.user.id, dto);
  }

  @Post('withdraw')
  withdraw(@Request() req, @Body() dto: WithdrawDto) {
    return this.walletService.withdraw(req.user.id, dto);
  }

  @Post('invest')
  invest(@Request() req, @Body() dto: InvestDto) {
    return this.walletService.invest(req.user.id, dto.productId, dto.amount, dto.currency);
  }

  @Post('redeem/:holdingId')
  redeem(@Request() req, @Param('holdingId') holdingId: string) {
    return this.walletService.redeem(req.user.id, holdingId);
  }
}
