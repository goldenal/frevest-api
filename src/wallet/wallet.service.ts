import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';
import { FundWalletDto, WithdrawDto, AddLinkedAccountDto } from './dto/fund.dto';

@Injectable()
export class WalletService {
  constructor(private store: InMemoryStore) {}

  getBalance(userId: string) {
    const user = this.store.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');
    return {
      ngn: user.walletNgn,
      usd: user.walletUsd,
      ngnEquivInUsd: +(user.walletNgn / 1505).toFixed(2),
      usdEquivInNgn: Math.round(user.walletUsd * 1505),
    };
  }

  getLinkedAccounts(userId: string) {
    return this.store.getLinkedAccountsByUser(userId);
  }

  addLinkedAccount(userId: string, dto: AddLinkedAccountDto) {
    return this.store.createLinkedAccount({
      userId,
      type: dto.type,
      name: dto.name,
      last4: dto.last4,
      isDefault: false,
      meta: dto.meta,
    });
  }

  removeLinkedAccount(userId: string, accountId: string) {
    const removed = this.store.deleteLinkedAccount(accountId, userId);
    if (!removed) throw new NotFoundException('Linked account not found');
    return { message: 'Account removed' };
  }

  fund(userId: string, dto: FundWalletDto) {
    const user = this.store.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const dailyLimit = user.tier === 1 ? 5_000_000 : 50_000_000;
    if (dto.currency === 'NGN' && dto.amount > dailyLimit) {
      throw new BadRequestException(`Amount exceeds daily limit of ₦${dailyLimit.toLocaleString()}`);
    }

    if (dto.currency === 'NGN') {
      this.store.updateUser(userId, { walletNgn: user.walletNgn + dto.amount });
    } else {
      this.store.updateUser(userId, { walletUsd: user.walletUsd + dto.amount });
    }

    this.store.createTransaction({
      userId,
      date: new Date().toISOString().split('T')[0],
      type: 'deposit',
      title: 'Wallet funded',
      meta: `Via ${dto.method}`,
      amount: dto.currency === 'NGN' ? dto.amount : 0,
      usd: dto.currency === 'USD' ? dto.amount : undefined,
    });

    const updated = this.store.findUserById(userId)!;
    return {
      message: `${dto.currency === 'NGN' ? '₦' : '$'}${dto.amount.toLocaleString()} funded successfully`,
      balance: { ngn: updated.walletNgn, usd: updated.walletUsd },
    };
  }

  withdraw(userId: string, dto: WithdrawDto) {
    const user = this.store.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const accounts = this.store.getLinkedAccountsByUser(userId);
    const account = accounts.find(a => a.id === dto.linkedAccountId);
    if (!account) throw new NotFoundException('Linked account not found');

    if (dto.currency === 'NGN') {
      if (user.walletNgn < dto.amount) {
        throw new BadRequestException('Insufficient NGN balance');
      }
      this.store.updateUser(userId, { walletNgn: user.walletNgn - dto.amount });
    } else {
      if (user.walletUsd < dto.amount) {
        throw new BadRequestException('Insufficient USD balance');
      }
      this.store.updateUser(userId, { walletUsd: user.walletUsd - dto.amount });
    }

    this.store.createTransaction({
      userId,
      date: new Date().toISOString().split('T')[0],
      type: 'withdraw',
      title: 'Withdraw to bank',
      meta: `${account.name} ••${account.last4}`,
      amount: dto.currency === 'NGN' ? -dto.amount : 0,
      usd: dto.currency === 'USD' ? dto.amount : undefined,
    });

    const updated = this.store.findUserById(userId)!;
    return {
      message: `${dto.currency === 'NGN' ? '₦' : '$'}${dto.amount.toLocaleString()} withdrawal initiated`,
      estimatedArrival: 'Under 5 minutes',
      balance: { ngn: updated.walletNgn, usd: updated.walletUsd },
    };
  }

  invest(userId: string, productId: string, amount: number, currency: 'NGN' | 'USD') {
    const user = this.store.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const product = this.store.getProductById(productId);
    if (!product) throw new NotFoundException('Product not found');

    if (amount < product.minimum) {
      throw new BadRequestException(`Minimum investment is ${product.currency === 'USD' ? '$' : '₦'}${product.minimum}`);
    }

    if (currency === 'NGN' && user.walletNgn < amount) {
      throw new BadRequestException('Insufficient NGN balance');
    }
    if (currency === 'USD' && user.walletUsd < amount) {
      throw new BadRequestException('Insufficient USD balance');
    }

    if (currency === 'NGN') {
      this.store.updateUser(userId, { walletNgn: user.walletNgn - amount });
    } else {
      this.store.updateUser(userId, { walletUsd: user.walletUsd - amount });
    }

    const existing = this.store.getHoldingByUserAndProduct(userId, productId);
    if (existing) {
      const units = amount / (existing.current / existing.units);
      this.store.updateHolding(existing.id, {
        invested: existing.invested + amount,
        current: existing.current + amount,
        units: existing.units + units,
      });
    } else {
      this.store.createHolding({
        userId,
        productId,
        invested: amount,
        current: amount,
        units: currency === 'NGN' ? amount / 100 : amount,
        since: new Date().toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }),
        currency,
      });
    }

    this.store.createTransaction({
      userId,
      date: new Date().toISOString().split('T')[0],
      type: 'buy',
      title: product.name,
      meta: 'Subscribe',
      amount: currency === 'NGN' ? -amount : 0,
      usd: currency === 'USD' ? amount : undefined,
    });

    return {
      message: `Successfully invested ${currency === 'USD' ? '$' : '₦'}${amount.toLocaleString()} in ${product.name}`,
      product,
    };
  }

  redeem(userId: string, holdingId: string) {
    const user = this.store.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const holdings = this.store.getHoldingsByUser(userId);
    const holding = holdings.find(h => h.id === holdingId);
    if (!holding) throw new NotFoundException('Holding not found');

    const product = this.store.getProductById(holding.productId);
    if (!product) throw new NotFoundException('Product not found');

    if (holding.currency === 'NGN') {
      this.store.updateUser(userId, { walletNgn: user.walletNgn + holding.current });
    } else {
      this.store.updateUser(userId, { walletUsd: user.walletUsd + holding.current });
    }

    this.store.createTransaction({
      userId,
      date: new Date().toISOString().split('T')[0],
      type: 'sell',
      title: product.name,
      meta: 'Redeemed',
      amount: holding.currency === 'NGN' ? holding.current : 0,
      usd: holding.currency === 'USD' ? holding.current : undefined,
    });

    const updated = this.store.findUserById(userId)!;
    return {
      message: `${product.name} redeemed successfully`,
      amountReturned: holding.current,
      currency: holding.currency,
      balance: { ngn: updated.walletNgn, usd: updated.walletUsd },
    };
  }
}
