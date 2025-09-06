import axios from 'axios';

class SomniaService {
  constructor() {
    this.baseURL = 'https://somnia.w3us.site/api/v2/';
    this.chainId = process.env.CHAIN_ID || "50312"; // Default to Somnia testnet
    this.apiKey = process.env.SOMANIA_API_KEY || "";
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        //'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 20000
    });
  }

  async getSupportedTokens() {
    try {
      const response = await this.client.get(`/tokens?type=ERC-20`);
      return response.data.items;
    } catch (error) {
      console.error('1inch tokens error:', error.response?.data || error.message);
      throw new Error(`Failed to get supported tokens: ${error.message}`);
    }
  }

}

export const somniaService = new SomniaService();