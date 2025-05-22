// src/App.tsx
import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Snackbar,
  Alert,
  useColorScheme,
  useMediaQuery
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material';

// 导入配置和组件
import { theme } from './config/theme';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import WalletPage from './pages/Wallet';
import MiningPage from './pages/Mining';
import TransactionsPage from './pages/Transactions';
import BlockchainPage from './pages/Blockchain';

// 导入类型和服务
import { WalletData, BlockchainInfo } from './types';
import { BlockchainAPI, WalletAPI } from './services/api';

// 主题切换组件
const ThemeToggle: React.FC = () => {
  const { mode, setMode } = useColorScheme();

  const handleToggle = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <IconButton 
      color="inherit" 
      onClick={handleToggle}
      aria-label="切换主题"
      size="large"
    >
      {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
};

const AppContent: React.FC = () => {
  // 状态管理
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [blockchainInfo, setBlockchainInfo] = useState<BlockchainInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 响应式断点
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // 从本地存储恢复数据
  useEffect(() => {
    const savedWallets = localStorage.getItem('wallets');
    if (savedWallets) {
      try {
        setWallets(JSON.parse(savedWallets));
      } catch (error) {
        console.error('解析钱包数据失败:', error);
        setError('钱包数据损坏，已重置');
        localStorage.removeItem('wallets');
      }
    }

    const savedPage = localStorage.getItem('currentPage');
    if (savedPage) {
      setCurrentPage(savedPage);
    }

    setLoading(false);
  }, []);

  // 保存钱包到本地存储
  useEffect(() => {
    if (wallets.length > 0) {
      localStorage.setItem('wallets', JSON.stringify(wallets));
    } else {
      localStorage.removeItem('wallets');
    }
  }, [wallets]);

  // 保存当前页面
  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  // 获取区块链信息
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
    const interval = setInterval(fetchBlockchainInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  // 获取钱包余额
  useEffect(() => {
    const fetchWalletBalances = async () => {
      if (wallets.length === 0) return;

      try {
        const updatedWallets = await Promise.all(
          wallets.map(async (wallet) => {
            try {
              const balanceResponse = await WalletAPI.getWalletBalance(wallet.address);
              return {
                ...wallet,
                balance: balanceResponse.balance
              };
            } catch (error) {
              console.error(`获取钱包 ${wallet.address} 余额失败:`, error);
              return wallet;
            }
          })
        );
        setWallets(updatedWallets);
      } catch (err) {
        console.error('获取钱包余额失败', err);
      }
    };

    if (wallets.length > 0) {
      fetchWalletBalances();
      const interval = setInterval(fetchWalletBalances, 60000);
      return () => clearInterval(interval);
    }
  }, [wallets.length]);

  // 页面切换处理
  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  // 渲染当前页面
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard wallets={wallets} blockchainInfo={blockchainInfo} />;
      case 'wallet':
        return (
          <WalletPage 
            wallets={wallets} 
            setWallets={setWallets} 
            setError={setError} 
            setSuccess={setSuccess} 
          />
        );
      case 'mining':
        return (
          <MiningPage 
            wallets={wallets} 
            setError={setError} 
            setSuccess={setSuccess} 
          />
        );
      case 'transactions':
        return (
          <TransactionsPage 
            wallets={wallets} 
            setError={setError} 
            setSuccess={setSuccess} 
          />
        );
      case 'blockchain':
        return (
          <BlockchainPage 
            setError={setError} 
            setSuccess={setSuccess} 
          />
        );
      default:
        return <Dashboard wallets={wallets} blockchainInfo={blockchainInfo} />;
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        flexDirection="column"
      >
        <Typography variant="h6" color="text.secondary">
          正在加载区块链应用...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* 顶部导航栏 */}
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              区块链应用
            </Typography>
            <ThemeToggle />
          </Toolbar>
        </AppBar>

        {/* 主布局 */}
        <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            minHeight: '70vh',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            {/* 侧边导航 */}
            <Box sx={{ 
              width: isMobile ? '100%' : 250, 
              flexShrink: 0,
              order: isMobile ? 2 : 1
            }}>
              <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
            </Box>

            {/* 主内容区域 */}
            <Box sx={{ 
              flexGrow: 1, 
              minWidth: 0,
              order: isMobile ? 1 : 2
            }}>
              {renderCurrentPage()}
            </Box>
          </Box>
        </Container>

        {/* 页脚 */}
        <Box 
          component="footer" 
          sx={{ 
            py: 2, 
            px: 3, 
            mt: 'auto',
            backgroundColor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            区块链演示应用 © {new Date().getFullYear()}
          </Typography>
        </Box>
      </Box>

      {/* 错误提示 */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* 成功提示 */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setSuccess(null)}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContent />
    </ThemeProvider>
  );
};

export default App;