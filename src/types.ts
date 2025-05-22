export interface WalletData {
  address: string;
  publicKey: string;
  privateKey?: string;
  balance?: number;
}

export interface TransactionData {
  fromAddress: string | null;
  toAddress: string;
  amount: number;
  timestamp: number;
  signature?: string;
}

export interface BlockData {
  index: number;
  timestamp: number;
  hash: string;
  previousHash: string;
  nonce: number;
  transactions: TransactionData[];
}

export interface BlockchainInfo {
  chain: BlockData[];
  pendingTransactions: TransactionData[];
  difficulty: number;
  miningReward: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}