import axios from 'axios';
import { Product } from '../types';

export const GitHubStorageService = {
  async fetchProducts(): Promise<Product[]> {
    try {
      const { data } = await axios.get('/api/github/products');
      return data;
    } catch (e) {
      console.error('Failed to fetch products from GitHub:', e);
      return [];
    }
  },

  async updateProducts(products: Product[], message: string): Promise<void> {
    try {
      await axios.post('/api/github/update', { content: products, message });
    } catch (e) {
      console.error('Failed to update products in GitHub:', e);
      throw e;
    }
  },

  async saveProduct(product: Product): Promise<void> {
    const products = await this.fetchProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index > -1) {
      products[index] = product;
    } else {
      products.push(product);
    }
    await this.updateProducts(products, `Save product ${product.title}`);
  },

  async deleteProduct(productId: string): Promise<void> {
    const products = await this.fetchProducts();
    const filtered = products.filter(p => p.id !== productId);
    await this.updateProducts(filtered, `Delete product ${productId}`);
  }
};
