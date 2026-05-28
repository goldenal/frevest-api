import { Injectable } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';

function genPortfolioSeries(seed = 1.2, start = 2_650_000, drift = 0.002, vol = 0.012, n = 60): number[] {
  let v = start;
  const arr: number[] = [];
  let r = seed;
  for (let i = 0; i < n; i++) {
    r = (r * 9301 + 49297) % 233280;
    const rand = r / 233280;
    v = v * (1 + drift + (rand - 0.5) * vol);
    arr.push(Math.round(v));
  }
  return arr;
}

@Injectable()
export class PortfolioService {
  constructor(private store: InMemoryStore) {}

  getSummary(userId: string) {
    const holdings = this.store.getHoldingsByUser(userId);
    const products = this.store.getProducts();

    const ngnHoldings = holdings.filter(h => h.currency === 'NGN');
    const usdHoldings = holdings.filter(h => h.currency === 'USD');

    const totalNgn = ngnHoldings.reduce((s, h) => s + h.current, 0);
    const totalUsd = usdHoldings.reduce((s, h) => s + h.current, 0);
    const investedNgn = ngnHoldings.reduce((s, h) => s + h.invested, 0);
    const investedUsd = usdHoldings.reduce((s, h) => s + h.invested, 0);
    const earnedNgn = totalNgn - investedNgn;
    const earnedUsd = totalUsd - investedUsd;

    const series = genPortfolioSeries();

    return {
      totalNgn,
      totalUsd,
      investedNgn,
      investedUsd,
      earnedNgn,
      earnedUsd,
      yieldPct: investedNgn > 0 ? +((earnedNgn / investedNgn) * 100).toFixed(2) : 0,
      series,
    };
  }

  getHoldings(userId: string) {
    const holdings = this.store.getHoldingsByUser(userId);
    const products = this.store.getProducts();

    return holdings.map(h => {
      const product = products.find(p => p.id === h.productId);
      const gain = h.current - h.invested;
      const gainPct = h.invested > 0 ? +((gain / h.invested) * 100).toFixed(2) : 0;
      return { ...h, product, gain, gainPct };
    });
  }

  getAllocation(userId: string) {
    const holdings = this.store.getHoldingsByUser(userId);
    const products = this.store.getProducts();

    const catMap: Record<string, number> = {};
    const total = holdings.reduce((s, h) => s + h.current, 0);

    for (const h of holdings) {
      const p = products.find(x => x.id === h.productId);
      if (!p) continue;
      catMap[p.cat] = (catMap[p.cat] || 0) + h.current;
    }

    const allocation = Object.entries(catMap).map(([cat, value]) => ({
      cat,
      value,
      pct: total > 0 ? +((value / total) * 100).toFixed(1) : 0,
    }));

    const ngnTotal = holdings.filter(h => h.currency === 'NGN').reduce((s, h) => s + h.current, 0);
    const usdTotal = holdings.filter(h => h.currency === 'USD').reduce((s, h) => s + h.current, 0);

    const riskMap: Record<string, number> = { low: 0, moderate: 0, high: 0 };
    for (const h of holdings) {
      const p = products.find(x => x.id === h.productId);
      if (!p) continue;
      if (p.risk === 1) riskMap.low += h.current;
      else if (p.risk === 2) riskMap.moderate += h.current;
      else riskMap.high += h.current;
    }

    return {
      allocation,
      currency: {
        ngn: { value: ngnTotal, pct: total > 0 ? +((ngnTotal / total) * 100).toFixed(1) : 0 },
        usd: { value: usdTotal, pct: total > 0 ? +((usdTotal / total) * 100).toFixed(1) : 0 },
      },
      risk: {
        low: { value: riskMap.low, pct: total > 0 ? +((riskMap.low / total) * 100).toFixed(1) : 0 },
        moderate: { value: riskMap.moderate, pct: total > 0 ? +((riskMap.moderate / total) * 100).toFixed(1) : 0 },
        high: { value: riskMap.high, pct: total > 0 ? +((riskMap.high / total) * 100).toFixed(1) : 0 },
      },
    };
  }

  getGrowth(userId: string) {
    const holdings = this.store.getHoldingsByUser(userId);
    const products = this.store.getProducts();

    const topPerformers = [...holdings]
      .map(h => {
        const product = products.find(p => p.id === h.productId);
        const gainPct = h.invested > 0 ? +((h.current - h.invested) / h.invested * 100).toFixed(2) : 0;
        return { ...h, product, gainPct };
      })
      .sort((a, b) => b.gainPct - a.gainPct)
      .slice(0, 3);

    const monthlyData = [
      { label: 'J', deposited: 200000, earned: 18000 },
      { label: 'F', deposited: 320000, earned: 30000 },
      { label: 'M', deposited: 150000, earned: 42000 },
      { label: 'A', deposited: 480000, earned: 55000 },
      { label: 'M', deposited: 220000, earned: 64000 },
      { label: 'J', deposited: 180000, earned: 76000 },
      { label: 'J', deposited: 350000, earned: 88000 },
      { label: 'A', deposited: 410000, earned: 102000 },
      { label: 'S', deposited: 280000, earned: 118000 },
      { label: 'O', deposited: 260000, earned: 132000 },
      { label: 'N', deposited: 320000, earned: 142000 },
      { label: 'D', deposited: 200000, earned: 158000 },
    ];

    return { topPerformers, monthlyData };
  }
}
