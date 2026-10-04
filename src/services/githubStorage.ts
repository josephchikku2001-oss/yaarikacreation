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
    // 1. Try static public products.json
    try {
      const res = await axios.get('/products.json', { validateStatus: status => status === 200 });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch {}

    // 2. Try backend API proxy
    try {
      const { data } = await axios.get('/api/github/products', { headers: this.getHeaders() });
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (e) {
      // 3. Try direct GitHub raw URL fallback
      try {
        const { repo } = this.getConfig();
        if (repo) {
          const rawUrl = `https://raw.githubusercontent.com/${repo}/main/products.json`;
          const rawRes = await axios.get(rawUrl);
          if (rawRes.data && Array.isArray(rawRes.data)) {
            return rawRes.data;
          }
        }
      } catch {}
      try {
        const { repo } = this.getConfig();
        if (repo) {
          const rawUrlMaster = `https://raw.githubusercontent.com/${repo}/master/products.json`;
          const rawResMaster = await axios.get(rawUrlMaster);
          if (rawResMaster.data && Array.isArray(rawResMaster.data)) {
            return rawResMaster.data;
          }
        }
      } catch {}
    }

    return [];
  },

  async updateProducts(products: Product[], message: string): Promise<void> {
    // 1. Try backend API proxy
    try {
      await axios.post('/api/github/update', { content: products, message }, { headers: this.getHeaders() });
      return;
    } catch (e) {
      // 2. Fallback to direct client-side GitHub API call (for static hosts like Vercel)
      const { token, repo } = this.getConfig();
      if (!token || !repo) {
        throw new Error('GitHub token and repo not configured for direct update.');
      }

      let sha: string | undefined = undefined;
      try {
        const { data: fileData } = await axios.get(
          `https://api.github.com/repos/${repo}/contents/products.json`,
          { headers: { Authorization: `token ${token}` } }
        );
        sha = fileData.sha;
      } catch {}

      await axios.put(
        `https://api.github.com/repos/${repo}/contents/products.json`,
        {
          message: message || 'Update products via Admin Portal',
          content: b58Encode(JSON.stringify(products, null, 2)),
          ...(sha ? { sha } : {})
        },
        { headers: { Authorization: `token ${token}` } }
      );
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
      // Fallback client-side verification for static hosting
      if (!token || !repo) {
        return { success: false, hasToken: !!token, hasRepo: !!repo, error: 'Token and repo are required.' };
      }
      try {
        const repoCheck = await axios.get(
          `https://api.github.com/repos/${repo}`,
          { headers: { Authorization: `token ${token}` } }
        );
        if (repoCheck.status === 200) {
          return { hasToken: true, hasRepo: true, repoAccess: true, readSuccess: true, writeSuccess: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'GitHub verification failed' };
      }
      return { success: false, error: 'Verification failed' };
    }
  }
};

// Base64 helper for browser / Vercel static environments
function b58Encode(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
}


