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
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['x-github-token'] = token;
    if (repo) headers['x-github-repo'] = repo;
    return headers;
  },

  async fetchProducts(): Promise<Product[]> {
    // 1. Try static public products.json using native fetch
    try {
      const res = await fetch('/products.json');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch {}

    // 2. Try backend API proxy using native fetch
    try {
      const res = await fetch('/api/github/products', { headers: this.getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch {}

    // 3. Try direct GitHub raw URL fallback using native fetch
    try {
      const { repo } = this.getConfig();
      if (repo) {
        const rawRes = await fetch(`https://raw.githubusercontent.com/${repo}/main/products.json`);
        if (rawRes.ok) {
          const data = await rawRes.json();
          if (Array.isArray(data)) return data;
        }
      }
    } catch {}

    try {
      const { repo } = this.getConfig();
      if (repo) {
        const rawRes = await fetch(`https://raw.githubusercontent.com/${repo}/master/products.json`);
        if (rawRes.ok) {
          const data = await rawRes.json();
          if (Array.isArray(data)) return data;
        }
      }
    } catch {}

    return [];
  },

  async updateProducts(products: Product[], message: string): Promise<void> {
    // 1. Try backend API proxy using native fetch
    try {
      const res = await fetch('/api/github/update', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ content: products, message })
      });
      if (res.ok) return;
    } catch {}

    // 2. Fallback to direct client-side GitHub API call (for static hosts like Vercel)
    const { token, repo } = this.getConfig();
    if (!token || !repo) {
      throw new Error('GitHub token and repo not configured for direct update.');
    }

    let sha: string | undefined = undefined;
    try {
      const fileRes = await fetch(`https://api.github.com/repos/${repo}/contents/products.json`, {
        headers: { Authorization: `token ${token}` }
      });
      if (fileRes.ok) {
        const fileData = await fileRes.json();
        sha = fileData.sha;
      }
    } catch {}

    const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/products.json`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message || 'Update products via Admin Portal',
        content: b58Encode(JSON.stringify(products, null, 2)),
        ...(sha ? { sha } : {})
      })
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      throw new Error(`GitHub update failed: ${errText}`);
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
      const res = await fetch('/api/github/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, repo })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    // Fallback client-side verification for static hosting
    if (!token || !repo) {
      return { success: false, hasToken: !!token, hasRepo: !!repo, error: 'Token and repo are required.' };
    }
    try {
      const repoCheck = await fetch(`https://api.github.com/repos/${repo}`, {
        headers: { Authorization: `token ${token}` }
      });
      if (repoCheck.ok) {
        return { hasToken: true, hasRepo: true, repoAccess: true, readSuccess: true, writeSuccess: true };
      }
      return { success: false, error: 'Invalid repository or token.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'GitHub verification failed' };
    }
  }
};

function b58Encode(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
}
