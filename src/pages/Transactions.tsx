import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { WalletData, TransactionData } from '../types';
import { TransactionAPI, WalletAPI } from '../services/api';

interface TransactionsPageProps {
  wallets: WalletData[];
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({ 
  wallets, 
  setError, 
  setSuccess 
}) => {
  const [selectedWalletAddress, setSelectedWalletAddress] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState<TransactionData[]>([]);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletAddress) {
      setSelectedWalletAddress(wallets[0].address);
    }
  }, [wallets, selectedWalletAddress]);

  useEffect(() => {
    if (selectedWalletAddress) {
      const selectedWallet = wallets.find(w => w.address === selectedWalletAddress);
      if (selectedWallet && selectedWallet.privateKey) {
        setPrivateKey(selectedWallet.privateKey);
      }
      fetchWalletBalance(selectedWalletAddress);
    }
  }, [selectedWalletAddress, wallets]);

  useEffect(() => {
    const fetchPendingTransactions = async () => {
      try {
        const response = await TransactionAPI.getPendingTransactions();
        if (response.success) {
          setPendingTransactions(response.pendingTransactions);
        }
      } catch (error) {
        console.error('获取待处理交易失败:', error);
      }
    };

    fetchPendingTransactions();
    const interval = setInterval(fetchPendingTransactions, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchWalletBalance = async (address: string) => {
    try {
      const response = await WalletAPI.getWalletBalance(address);
      if (response.success) {
        setBalance(response.balance);
      }
    } catch (error) {
      console.error('获取钱包余额失败:', error);
    }
  };

  const handleCreateTransaction = async () => {
    if (!selectedWalletAddress || !recipientAddress.trim() || !amount.trim() || !privateKey.trim()) {
      setError('请填写所有必需字段');
      return;
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('请输入有效的金额');
      return;
    }

    if (balance !== null && parseFloat(amount) > balance) {
      setError(`余额不足。当前余额: ${balance}`);
      return;
    }

    setLoading(true);
    try {
      const response = await TransactionAPI.createTransaction(
        selectedWalletAddress,
        recipientAddress,
        parseFloat(amount),
        privateKey
      );
      
      if (response.success) {
        setSuccess('交易创建成功！正在等待矿工确认。');
        setRecipientAddress('');
        setAmount('');
        
        const pendingResponse = await TransactionAPI.getPendingTransactions();
        if (pendingResponse.success) {
          setPendingTransactions(pendingResponse.pendingTransactions);
        }
        
        fetchWalletBalance(selectedWalletAddress);
      }
    } catch (error) {
      setError('创建交易失败，请检查输入是否正确。');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateAddress = (address: string | null) => {
    if (address === null) return '系统';
    return `${address.substring(0, 12)}...${address.substring(address.length - 8)}`;
  };

  return (
    <div>
      <Typography variant="h4" className="mb-6">交易</Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6}}>
          <Paper className="p-4">
            <Typography variant="h6" className="mb-4">创建新交易</Typography>

            {wallets.length === 0 ? (
              <Alert severity="warning">您需要先创建一个钱包才能进行交易。</Alert>
            ) : (
              <>
                <FormControl fullWidth margin="normal">
                  <InputLabel>发送方钱包</InputLabel>
                  <Select
                    value={selectedWalletAddress}
                    label="发送方钱包"
                    onChange={(e) => setSelectedWalletAddress(e.target.value)}
                  >
                    {wallets.map((wallet) => (
                      <MenuItem key={wallet.address} value={wallet.address}>
                        {truncateAddress(wallet.address)} (余额: {wallet.balance ?? '加载中'})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {balance !== null && (
                  <Alert severity="info" className="my-2">
                    当前余额: <strong>{balance} 代币</strong>
                  </Alert>
                )}

                <TextField
                  label="接收方地址"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="输入接收方的钱包地址"
                />

                <TextField
                  label="金额"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="输入要发送的代币数量"
                />

                <TextField
                  label="私钥"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  type="password"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="输入发送方钱包的私钥"
                />

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                  onClick={handleCreateTransaction}
                  disabled={loading || !selectedWalletAddress || !recipientAddress || !amount || !privateKey}
                  className="mt-4 py-3"
                >
                  {loading ? '处理中...' : '发送交易'}
                </Button>
              </>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6}}>
          <Paper className="p-4">
            <Typography variant="h6" className="mb-4">待处理交易</Typography>

            {pendingTransactions.length === 0 ? (
              <Alert severity="info">当前没有待处理的交易。</Alert>
            ) : (
              <div className="space-y-3">
                {pendingTransactions.map((tx, index) => (
                  <Card key={index} className="bg-yellow-50">
                    <CardContent>
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 3 }}>
                          <Typography variant="body2" color="textSecondary">发送方:</Typography>
                        </Grid>
                        <Grid size={{ xs: 9 }}>
                          <Typography variant="body2" className="font-mono">
                            {tx.fromAddress === null ? (
                              <Chip label="系统奖励" size="small" color="success" />
                            ) : (
                              truncateAddress(tx.fromAddress)
                            )}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 3 }}>
                          <Typography variant="body2" color="textSecondary">接收方:</Typography>
                        </Grid>
                        <Grid size={{ xs: 9 }}>
                          <Typography variant="body2" className="font-mono">
                            {truncateAddress(tx.toAddress)}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 3 }}>
                          <Typography variant="body2" color="textSecondary">金额:</Typography>
                        </Grid>
                        <Grid size={{ xs: 9 }}>
                          <Typography variant="body2">
                            <strong>{tx.amount} 代币</strong>
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 3 }}>
                          <Typography variant="body2" color="textSecondary">时间:</Typography>
                        </Grid>
                        <Grid size={{ xs: 9 }}>
                          <Typography variant="body2">
                            {formatTimestamp(tx.timestamp)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default TransactionsPage;