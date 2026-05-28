import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsOptional, IsString, IsNumberString } from 'class-validator';

class TransactionQueryDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsNumberString()
  @IsOptional()
  limit?: string;

  @IsNumberString()
  @IsOptional()
  offset?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  findAll(@Request() req, @Query() query: TransactionQueryDto) {
    return this.transactionsService.findAll(
      req.user.id,
      query.type,
      query.limit ? parseInt(query.limit) : 20,
      query.offset ? parseInt(query.offset) : 0,
    );
  }
}
