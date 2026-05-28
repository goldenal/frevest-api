import { Injectable } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';

@Injectable()
export class TransactionsService {
  constructor(private store: InMemoryStore) {}

  findAll(userId: string, type?: string, limit = 20, offset = 0) {
    let txs = this.store.getTransactionsByUser(userId);

    if (type) {
      txs = txs.filter(t => t.type === type);
    }

    const total = txs.length;
    const data = txs.slice(offset, offset + limit);

    return { total, limit, offset, transactions: data };
  }
}
