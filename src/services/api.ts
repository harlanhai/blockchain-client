import axios from 'axios';
import { BlockchainInfo, WalletData } from '../types';

// 配置API基础URL
const API_BASE_URL = 'http://localhost:3001/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 区块链相关API
export const BlockchainAPI = {
  // 获取区块链信息
  getBlockchainInfo: async (): Promise<BlockchainInfo> => {
    try {
      const response = await api.get('/blockchain');
      return response.data;
    } catch (error) {
      console.error('获取区块链信息失败:', error);
      throw error;
    }
  },

  // 验证区块链
  validateBlockchain: async () => {
    try {
      const response = await api.get('/blockchain/validate');
      return response.data;
    } catch (error) {
      console.error('验证区块链失败:', error);
      throw error;
    }
  }
};

// 钱包相关API
export const WalletAPI = {
  // 创建新钱包
  createWallet: async () => {
    try {
      const response = await api.post('/wallet/create');
      return response.data;
    } catch (error) {
      console.error('创建钱包失败:', error);
      throw error;
    }
  },

  // 导入钱包
  importWallet: async (privateKey: string) => {
    try {
      const response = await api.post('/wallet/import', { privateKey });
      return response.data;
    } catch (error) {
      console.error('导入钱包失败:', error);
      throw error;
    }
  },

  // 获取钱包余额
  getWalletBalance: async (address: string) => {
    try {
      const response = await api.get(`/wallet/${address}/balance`);
      return response.data;
    } catch (error) {
      console.error('获取钱包余额失败:', error);
      throw error;
    }
  }
};

// 交易相关API
export const TransactionAPI = {
  // 创建交易
  createTransaction: async (fromAddress: string, toAddress: string, amount: number, privateKey: string) => {
    try {
      const response = await api.post('/transaction', {
        fromAddress,
        toAddress,
        amount,
        privateKey
      });
      return response.data;
    } catch (error) {
      console.error('创建交易失败:', error);
      throw error;
    }
  },

  // 获取待处理交易
  getPendingTransactions: async () => {
    try {
      const response = await api.get('/transactions/pending');
      return response.data;
    } catch (error) {
      console.error('获取待处理交易失败:', error);
      throw error;
    }
  }
};

// 挖矿相关API
export const MiningAPI = {
  // 开始挖矿
  startMining: async (minerAddress: string) => {
    try {
      const response = await api.post('/mine', { minerAddress });
      return response.data;
    } catch (error) {
      console.error('挖矿失败:', error);
      throw error;
    }
  }
};

export default {
  BlockchainAPI,
  WalletAPI,
  TransactionAPI,
  MiningAPI
};