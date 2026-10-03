import axios from 'axios';
import { Product } from '../types';

export const GitHubStorageService = {
  getConfig() {
    try {
      const config = localStorage.getItem('yaarika_github_config');
      return config ? JSON.parse(config) : { token: '', repo: '' };
    } catch {
      return { token: '', repo: '' };
    }
  },

  saveConfig(token: string, repo: string) {
    try {
      localStorage.setItem('yaarika_github_config', JSON.stringify({ token: token.trim(), repo: repo.trim() }));
    } catch {}
  },

  getHeaders() {
    const { token, repo } = this.getConfig();
    const headers: Record<string, string> = {};
    if (token) headers['x-github-token'] = token;
    if (repo) headers['x-github-repo'] = repo;
    return headers;
  },

  async fetchProducts(): Promise<Product[]> {
    try {
      const { data } = await axios.get('/api/github/products', { headers: this.getHeaders() });
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error('Failed to fetch products from GitHub:', e);
      return [];
    }
  },

  async updateProducts(products: Product[], message: string): Promise<void> {
    try {
      await axios.post('/api/github/update', { content: products, message }, { headers: this.getHeaders() });
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
  },

  async verifyConnection(token: string, repo: string): Promise<any> {
    try {
      const { data } = await axios.post('/api/github/verify', { token, repo });
      return data;
    } catch (e: any) {
      return { success: false, error: e.message || 'Verification request failed' };
    }
  }
};

