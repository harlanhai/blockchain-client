import React from 'react';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalanceWallet as WalletIcon,
  MonetizationOn as MiningIcon,
  SwapHoriz as TransactionIcon,
  Link as BlockchainIcon
} from '@mui/icons-material';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const navItems = [
    { text: '仪表盘', icon: <DashboardIcon />, page: 'dashboard' },
    { text: '钱包', icon: <WalletIcon />, page: 'wallet' },
    { text: '挖矿', icon: <MiningIcon />, page: 'mining' },
    { text: '交易', icon: <TransactionIcon />, page: 'transactions' },
    { text: '区块链', icon: <BlockchainIcon />, page: 'blockchain' }
  ];

  return (
    <Paper elevation={2} className="h-full">
      <List component="nav" disablePadding>
        {navItems.map((item) => (
          <ListItemButton
            key={item.text}
            selected={currentPage === item.page}
            onClick={() => onPageChange(item.page)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.main',
                },
              },
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              borderRadius: 1,
              margin: 0.5,
            }}
          >
            <ListItemIcon
              sx={{
                color: currentPage === item.page ? 'inherit' : 'action.active',
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: currentPage === item.page ? 600 : 400,
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
};

export default Navigation;