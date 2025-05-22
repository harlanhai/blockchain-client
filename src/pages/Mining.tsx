import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { MonetizationOn as MiningIcon } from '@mui/icons-material';
import { WalletData, BlockchainInfo, BlockData } from '../types';
import { MiningAPI, BlockchainAPI } from '../services/api';

interface MiningPageProps {
  wallets: WalletData[];
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
}

const MiningPage: React.FC<MiningPageProps> = ({ wallets, setError, setSuccess }) => {
  const [selectedWalletAddress, setSelectedWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [miningHistory, setMiningHistory] = useState<BlockData[]>([]);
  const [blockchainInfo, setBlockchainInfo] = useState<BlockchainInfo | null>(null);

  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletAddress) {
      setSelectedWalletAddress(wallets[0].address);
    }
  }, [wallets, selectedWalletAddress]);

  useEffect(() => {
    const fetchBlockchainInfo = async () => {
      try {
        const response = await BlockchainAPI.getBlockchainInfo();
        setBlockchainInfo(response);
      } catch (error) {
        console.error('获取区块链信息失败:', error);
      }
    };
    fetchBlockchainInfo();
  }, []);

  const handleMining = async () => {
    if (!selectedWalletAddress) {
      setError('请选择接收挖矿奖励的钱包');
      return;
    }

    setLoading(true);
    try {
      const response = await MiningAPI.startMining(selectedWalletAddress);
      if (response.success) {
        setSuccess(`挖矿成功! 区块 #${response.block.index} 已被添加到区块链`);
        setMiningHistory(prev => [response.block, ...prev].slice(0, 10));
      }
    } catch (error) {
      setError('挖矿过程中出错');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div>
      <Typography variant="h4" className="mb-6">挖矿</Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6}}>
          <Paper className="p-4 mb-4">
            <Typography variant="h6" className="mb-4">开始挖矿</Typography>
            
            <Alert severity="info" className="mb-4">
              通过挖矿可以处理待确认的交易并获得挖矿奖励。
              <br />
              当前挖矿奖励: <strong>{blockchainInfo?.miningReward || 0} 代币</strong>
              <br />
              当前难度等级: <strong>{blockchainInfo?.difficulty || 0}</strong>
              <br />
              待处理交易: <strong>{blockchainInfo?.pendingTransactions.length || 0} 笔</strong>
            </Alert>

            {wallets.length === 0 ? (
              <Alert severity="warning">您需要先创建一个钱包来接收挖矿奖励。</Alert>
            ) : (
              <>
                <FormControl fullWidth margin="normal">
                  <InputLabel>接收奖励的钱包</InputLabel>
                  <Select
                    value={selectedWalletAddress}
                    label="接收奖励的钱包"
                    onChange={(e) => setSelectedWalletAddress(e.target.value)}
                  >
                    {wallets.map((wallet) => (
                      <MenuItem key={wallet.address} value={wallet.address}>
                        {wallet.address.substring(0, 20)}... (余额: {wallet.balance ?? '加载中'})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <MiningIcon />}
                  onClick={handleMining}
                  disabled={loading || !selectedWalletAddress}
                  className="mt-4 py-3"
                >
                  {loading ? '正在挖矿...' : '开始挖矿'}
                </Button>
              </>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6}}>
          <Paper className="p-4">
            <Typography variant="h6" className="mb-4">挖矿历史记录</Typography>

            {miningHistory.length === 0 ? (
              <Alert severity="info">您还没有挖矿记录。开始挖矿以查看记录。</Alert>
            ) : (
              <div className="space-y-3">
                {miningHistory.map((block) => (
                  <Card key={block.hash} className="bg-gray-50">
                    <CardContent>
                      <Typography variant="subtitle1">区块 #{block.index}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        时间: {formatTimestamp(block.timestamp)}
                      </Typography>
                      <Typography variant="body2" className="font-mono" color="textSecondary">
                        哈希: {block.hash.substring(0, 16)}...
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        交易数: {block.transactions.length}
                      </Typography>
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

export default MiningPage;