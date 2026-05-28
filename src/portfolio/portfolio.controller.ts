import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('portfolio')
export class PortfolioController {
  constructor(private portfolioService: PortfolioService) {}

  @Get('summary')
  getSummary(@Request() req) {
    return this.portfolioService.getSummary(req.user.id);
  }

  @Get('holdings')
  getHoldings(@Request() req) {
    return this.portfolioService.getHoldings(req.user.id);
  }

  @Get('allocation')
  getAllocation(@Request() req) {
    return this.portfolioService.getAllocation(req.user.id);
  }

  @Get('growth')
  getGrowth(@Request() req) {
    return this.portfolioService.getGrowth(req.user.id);
  }
}
