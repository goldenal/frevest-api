import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryStore } from '../store/in-memory.store';
import { ProductQueryDto } from './dto/query.dto';

@Injectable()
export class ProductsService {
  constructor(private store: InMemoryStore) {}

  findAll(query: ProductQueryDto) {
    let products = this.store.getProducts();

    if (query.cat && query.cat !== 'all') {
      products = products.filter(p => p.cat === query.cat);
    }

    if (query.search) {
      const q = query.search.toLowerCase();
      products = products.filter(
        p => p.name.toLowerCase().includes(q) || p.issuer.toLowerCase().includes(q),
      );
    }

    if (query.currency) {
      products = products.filter(p => p.currency === query.currency);
    }

    if (query.sort === 'apy') {
      products = [...products].sort((a, b) => b.apy - a.apy);
    } else if (query.sort === 'risk') {
      products = [...products].sort((a, b) => a.risk - b.risk);
    } else if (query.sort === 'min') {
      products = [...products].sort((a, b) => a.minimum - b.minimum);
    }

    return { total: products.length, products };
  }

  findOne(id: string) {
    const product = this.store.getProductById(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  getHighlighted() {
    const products = this.store.getProducts();
    const sorted = [...products].sort((a, b) => b.apy - a.apy);
    return sorted[0] ?? null;
  }
}
