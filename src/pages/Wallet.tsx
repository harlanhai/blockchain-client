// src/pages/Wallet.tsx
import React, { useState } from 'react';
import { Typography, Paper, Button, TextField, Alert, Card, CardContent, CardActions, CircularProgress, Box, Grid } from '@mui/material';
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { WalletData } from '../types';
import { WalletAPI } from '../services/api';

interface WalletPageProps {
  wallets: WalletData[];
  setWallets: React.Dispatch<React.SetStateAction<WalletData[]>>;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
}

const WalletPage: React.FC<WalletPageProps> = ({ wallets, setWallets, setError, setSuccess }) => {
  const [privateKey, setPrivateKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateWallet = async () => {
    setLoading(true);
    try {
      const response = await WalletAPI.createWallet();
      if (response.success) {
        const newWallet = {
          address: response.wallet.address,
          publicKey: response.wallet.publicKey,
          privateKey: response.wallet.privateKey,
          balance: 0,
        };
        setWallets([...wallets, newWallet]);
        setSuccess('钱包创建成功！请务必保存您的私钥。');
      }
    } catch (err) {
      setError('创建钱包失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  const handleImportWallet = async () => {
    if (!privateKey.trim()) {
      setError('请输入私钥');
      return;
    }

    setLoading(true);
    try {
      const response = await WalletAPI.importWallet(privateKey);
      if (response.success) {
        const walletExists = wallets.some((w) => w.address === response.wallet.address);
        if (walletExists) {
          setError('该钱包已导入');
        } else {
          const importedWallet = {
            address: response.wallet.address,
            publicKey: response.wallet.publicKey,
            privateKey: privateKey,
            balance: 0,
          };
          setWallets([...wallets, importedWallet]);
          setSuccess('钱包导入成功！');
          setPrivateKey('');
        }
      }
    } catch (err) {
      setError('导入钱包失败，请检查私钥是否正确。');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(
      () => setSuccess(`${type} 已复制到剪贴板`),
      () => setError('复制失败，请手动复制')
    );
  };

  const handleDeleteWallet = (address: string) => {
    const updatedWallets = wallets.filter((w) => w.address !== address);
    setWallets(updatedWallets);
    setSuccess('钱包已删除');
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        我的钱包
      </Typography>

      <Grid container spacing={3}>
        {/* 钱包列表 */}
        <Grid size={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              钱包列表
            </Typography>
            {wallets.length === 0 ? (
              <Alert severity="info">您还没有钱包。创建一个新钱包或导入现有钱包。</Alert>
            ) : (
              <Grid container spacing={2}>
                {wallets.map((wallet) => (
                  <Grid size={12} key={wallet.address}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          余额: {wallet.balance ?? '加载中...'} 代币
                        </Typography>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" component="div">
                            地址:
                          </Typography>
                          <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', ml: 1, fontSize: '0.875rem' }}>
                            {wallet.address}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary" component="div">
                            公钥:
                          </Typography>
                          <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', ml: 1, fontSize: '0.875rem' }}>
                            {wallet.publicKey.substring(0, 32)}...
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button size="small" startIcon={<ContentCopyIcon />} onClick={() => copyToClipboard(wallet.address, '钱包地址')}>
                          复制地址
                        </Button>
                        {wallet.privateKey && (
                          <Button size="small" color="warning" startIcon={<ContentCopyIcon />} onClick={() => copyToClipboard(wallet.privateKey!, '私钥')}>
                            复制私钥
                          </Button>
                        )}
                        <Button size="small" color="error" onClick={() => handleDeleteWallet(wallet.address)}>
                          删除
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
        {/* 创建钱包 */}
        <Grid size={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              创建新钱包
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              创建一个新的区块链钱包以接收和发送代币。
            </Typography>
            <Button variant="contained" color="primary" fullWidth onClick={handleCreateWallet} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : '创建钱包'}
            </Button>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              导入钱包
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              使用私钥导入现有钱包。
            </Typography>
            <TextField
              fullWidth
              margin="normal"
              label="私钥"
              variant="outlined"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="输入您的私钥"
              sx={{ mb: 3 }}
            />
            <Button variant="contained" color="secondary" fullWidth onClick={handleImportWallet} disabled={loading || !privateKey.trim()}>
              {loading ? <CircularProgress size={24} /> : '导入钱包'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WalletPage;
