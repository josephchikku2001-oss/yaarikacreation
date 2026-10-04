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

  async fetchProducts(): Promise<Product[]> {
    // 1. Try static public products.json
    try {
      const res = await fetch('/products.json');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch {}

    // 2. Try direct GitHub raw URL using configured repo
    const { repo, token } = this.getConfig();
    if (repo) {
      try {
        const rawRes = await fetch(`https://raw.githubusercontent.com/${repo}/main/products.json?t=${Date.now()}`);
        if (rawRes.ok) {
          const data = await rawRes.json();
          if (Array.isArray(data)) return data;
        }
      } catch {}

      try {
        const rawResMaster = await fetch(`https://raw.githubusercontent.com/${repo}/master/products.json?t=${Date.now()}`);
        if (rawResMaster.ok) {
          const data = await rawResMaster.json();
          if (Array.isArray(data)) return data;
        }
      } catch {}

      // 3. Try GitHub contents API if token is available
      if (token) {
        try {
          const apiRes = await fetch(`https://api.github.com/repos/${repo}/contents/products.json`, {
            headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3.raw' }
          });
          if (apiRes.ok) {
            const data = await apiRes.json();
            if (Array.isArray(data)) return data;
          }
        } catch {}
      }
    }

    return [];
  },

  async updateProducts(products: Product[], message: string): Promise<void> {
    const { token, repo } = this.getConfig();
    if (!token || !repo) {
      throw new Error('GitHub token and repository (owner/repo) must be configured in Admin Portal -> GitHub & Sync Verification.');
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
        message: message || 'Update products via Yaarika Admin Portal',
        content: b58Encode(JSON.stringify(products, null, 2)),
        ...(sha ? { sha } : {})
      })
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      throw new Error(`GitHub commit failed: ${errText}`);
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
    if (!token || !repo) {
      return { success: false, hasToken: !!token, hasRepo: !!repo, error: 'GitHub Token and Repository (owner/repo) are required.' };
    }

    try {
      const repoCheck = await fetch(`https://api.github.com/repos/${repo}`, {
        headers: { Authorization: `token ${token}` }
      });
      if (!repoCheck.ok) {
        return { success: false, hasToken: true, hasRepo: true, repoAccess: false, error: 'Invalid repository name or unauthorized token.' };
      }

      // Test read/write products.json
      let sha: string | undefined = undefined;
      let readSuccess = false;
      try {
        const fileRes = await fetch(`https://api.github.com/repos/${repo}/contents/products.json`, {
          headers: { Authorization: `token ${token}` }
        });
        if (fileRes.ok) {
          const fileData = await fileRes.json();
          sha = fileData.sha;
          readSuccess = true;
        }
      } catch {
        readSuccess = true; // file can be created on first write
      }

      const timestamp = new Date().toISOString();
      const testPing = [{ id: 'verify-ping', title: `Sync Verification ${timestamp}`, price: 99, category: 'Fusion Wear', inStock: true, sizes: ['Free Size'], imageUrl: '', description: 'Verification test' }];

      const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/products.json`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Verification test sync at ${timestamp}`,
          content: b58Encode(JSON.stringify(testPing, null, 2)),
          ...(sha ? { sha } : {})
        })
      });

      const writeSuccess = putRes.ok;

      return {
        hasToken: true,
        hasRepo: true,
        repoAccess: true,
        readSuccess,
        writeSuccess,
        error: writeSuccess ? null : 'Failed to write products.json to repository.'
      };
    } catch (e: any) {
      return { success: false, hasToken: !!token, hasRepo: !!repo, error: e.message || 'GitHub verification failed' };
    }
  }
};

function b58Encode(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
}
