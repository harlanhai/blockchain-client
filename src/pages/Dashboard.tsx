import React from 'react';
import {
  Typography,
  Paper,
  Card,
  CardContent,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Link as BlockchainIcon,
  SwapHoriz as TransactionIcon,
  MonetizationOn as MiningIcon
} from '@mui/icons-material';
import { WalletData, BlockchainInfo } from '../types';

interface DashboardProps {
  wallets: WalletData[];
  blockchainInfo: BlockchainInfo | null;
}

const Dashboard: React.FC<DashboardProps> = ({ wallets, blockchainInfo }) => {
  const calculateTotalBalance = () => {
    return wallets.reduce((total, wallet) => total + (wallet.balance || 0), 0);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div>
      <Typography variant="h4" className="mb-6">区块链仪表盘</Typography>

      <Grid container spacing={4} className="mb-6">
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <div className="flex items-center mb-4">
                <WalletIcon className="text-blue-500 mr-2" />
                <Typography variant="h6">钱包</Typography>
              </div>
              <Typography variant="h4" className="mb-2">{wallets.length}</Typography>
              <Typography variant="body2" color="textSecondary">创建的钱包数量</Typography>
              <Typography variant="h5" className="mt-4 text-green-600">
                {calculateTotalBalance()} 代币
              </Typography>
              <Typography variant="body2" color="textSecondary">总余额</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <div className="flex items-center mb-4">
                <BlockchainIcon className="text-purple-500 mr-2" />
                <Typography variant="h6">区块链</Typography>
              </div>
              <Typography variant="h4" className="mb-2">{blockchainInfo?.chain.length || 0}</Typography>
              <Typography variant="body2" color="textSecondary">区块总数</Typography>
              <Typography variant="body1" className="mt-2">
                <strong>难度:</strong> {blockchainInfo?.difficulty || 0}
              </Typography>
              <Typography variant="body1">
                <strong>奖励:</strong> {blockchainInfo?.miningReward || 0} 代币
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <div className="flex items-center mb-4">
                <TransactionIcon className="text-amber-500 mr-2" />
                <Typography variant="h6">交易</Typography>
              </div>
              <Typography variant="h4" className="mb-2">{blockchainInfo?.pendingTransactions.length || 0}</Typography>
              <Typography variant="body2" color="textSecondary">待处理交易</Typography>
              <Alert severity="info" className="mt-2">
                待处理的交易需要被挖矿确认后才能生效。
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <div className="flex items-center mb-4">
                <MiningIcon className="text-green-500 mr-2" />
                <Typography variant="h6">挖矿</Typography>
              </div>
              <Typography variant="h4" className="mb-2">{blockchainInfo?.miningReward || 0}</Typography>
              <Typography variant="body2" color="textSecondary">当前挖矿奖励（代币）</Typography>
              <Alert severity="success" className="mt-2">
                开始挖矿来获取奖励并确认交易！
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper className="p-4">
            <Typography variant="h6" className="mb-4">最新区块</Typography>
            {blockchainInfo && blockchainInfo.chain.length > 0 ? (
              <Card className="bg-gray-50">
                <CardContent>
                  <Typography variant="subtitle1">
                    区块 #{blockchainInfo.chain[blockchainInfo.chain.length - 1].index}
                  </Typography>
                  <Divider className="my-2" />
                  <Typography variant="body2" className="mb-1">
                    <strong>时间:</strong> {formatTimestamp(blockchainInfo.chain[blockchainInfo.chain.length - 1].timestamp)}
                  </Typography>
                  <Typography variant="body2" className="mb-1">
                    <strong>哈希:</strong> <span className="font-mono">{blockchainInfo.chain[blockchainInfo.chain.length - 1].hash.substring(0, 20)}...</span>
                  </Typography>
                  <Typography variant="body2">
                    <strong>交易数:</strong> {blockchainInfo.chain[blockchainInfo.chain.length - 1].transactions.length}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Alert severity="info">没有区块数据可显示。</Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className="p-4">
            <Typography variant="h6" className="mb-4">我的钱包</Typography>
            {wallets.length > 0 ? (
              <div className="space-y-3">
                {wallets.slice(0, 2).map((wallet) => (
                  <Card key={wallet.address} className="bg-gray-50">
                    <CardContent>
                      <Typography variant="h6" className="text-blue-600">
                        {wallet.balance || 0} 代币
                      </Typography>
                      <Typography variant="body2" className="font-mono">
                        {wallet.address.substring(0, 20)}...
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
                {wallets.length > 2 && (
                  <Typography variant="body2" color="textSecondary">
                    还有 {wallets.length - 2} 个钱包...
                  </Typography>
                )}
              </div>
            ) : (
              <Alert severity="info">您还没有创建钱包。</Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;