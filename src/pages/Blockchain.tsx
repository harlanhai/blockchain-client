import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Box
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { BlockchainInfo } from '../types';
import { BlockchainAPI } from '../services/api';

interface BlockchainPageProps {
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
}

const BlockchainPage: React.FC<BlockchainPageProps> = ({ setError, setSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [blockchainInfo, setBlockchainInfo] = useState<BlockchainInfo | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    fetchBlockchainInfo();
  }, []);

  const fetchBlockchainInfo = async () => {
    setLoading(true);
    try {
      const response = await BlockchainAPI.getBlockchainInfo();
      setBlockchainInfo(response);
    } catch (error) {
      setError('获取区块链数据失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  const validateBlockchain = async () => {
    setValidating(true);
    try {
      const response = await BlockchainAPI.validateBlockchain();
      setIsValid(response.isValid);
      setSuccess(response.isValid ? '区块链验证通过！' : '区块链验证失败！');
    } catch (error) {
      setError('验证区块链失败，请重试。');
    } finally {
      setValidating(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateAddress = (address: string | null) => {
    if (address === null) return '系统';
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
  };

  const truncateHash = (hash: string) => {
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 10)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
        <Typography variant="body1" className="ml-2">加载区块链数据...</Typography>
      </div>
    );
  }

  return (
    <div>
      <Typography variant="h4" className="mb-6">区块链浏览器</Typography>

      <Paper className="p-4 mb-4">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h6">区块链信息</Typography>
            <Typography variant="body1">
              区块总数: <strong>{blockchainInfo?.chain.length}</strong>
            </Typography>
            <Typography variant="body1">
              挖矿难度: <strong>{blockchainInfo?.difficulty}</strong>
            </Typography>
            <Typography variant="body1">
              挖矿奖励: <strong>{blockchainInfo?.miningReward} 代币</strong>
            </Typography>
            <Typography variant="body1">
              待处理交易: <strong>{blockchainInfo?.pendingTransactions.length}</strong>
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} className="text-right">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={fetchBlockchainInfo}
              className="mr-2"
            >
              刷新
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={validating ? <CircularProgress size={20} /> : null}
              onClick={validateBlockchain}
              disabled={validating}
            >
              验证区块链
            </Button>
            
            {isValid !== null && (
              <Box className="mt-2">
                {isValid ? (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="区块链有效"
                    color="success"
                    variant="outlined"
                  />
                ) : (
                  <Chip
                    icon={<ErrorIcon />}
                    label="区块链无效"
                    color="error"
                    variant="outlined"
                  />
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" className="mb-4">区块列表</Typography>
      
      {blockchainInfo?.chain.slice().reverse().map((block) => (
        <Accordion key={block.hash} className="mb-2">
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container spacing={2}>
              <Grid item xs={2}>
                <Typography><strong>区块 #{block.index}</strong></Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography className="font-mono">{truncateHash(block.hash)}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography>{formatTimestamp(block.timestamp)}</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Card className="w-full bg-gray-50">
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>哈希:</strong> <span className="font-mono">{block.hash}</span>
                    </Typography>
                    <Typography variant="body2">
                      <strong>前一个区块哈希:</strong> <span className="font-mono">{block.previousHash}</span>
                    </Typography>
                    <Typography variant="body2">
                      <strong>Nonce:</strong> {block.nonce}
                    </Typography>
                    <Typography variant="body2">
                      <strong>时间戳:</strong> {formatTimestamp(block.timestamp)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>交易数量:</strong> {block.transactions.length}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider className="my-4" />

                {block.transactions.length > 0 ? (
                  <>
                    <Typography variant="subtitle2" className="mb-4">区块中的交易:</Typography>
                    
                    {block.transactions.map((tx, txIndex) => (
                      <Card key={txIndex} className="mb-2 bg-white">
                        <CardContent>
                          <Grid container spacing={1}>
                            <Grid item xs={3}>
                              <Typography variant="body2" color="textSecondary">发送方:</Typography>
                            </Grid>
                            <Grid item xs={9}>
                              <Typography variant="body2" className="font-mono">
                                {tx.fromAddress === null ? (
                                  <Chip label="系统奖励" size="small" color="success" />
                                ) : (
                                  truncateAddress(tx.fromAddress)
                                )}
                              </Typography>
                            </Grid>

                            <Grid item xs={3}>
                              <Typography variant="body2" color="textSecondary">接收方:</Typography>
                            </Grid>
                            <Grid item xs={9}>
                              <Typography variant="body2" className="font-mono">
                                {truncateAddress(tx.toAddress)}
                              </Typography>
                            </Grid>

                            <Grid item xs={3}>
                              <Typography variant="body2" color="textSecondary">金额:</Typography>
                            </Grid>
                            <Grid item xs={9}>
                              <Typography variant="body2">
                                <strong>{tx.amount} 代币</strong>
                              </Typography>
                            </Grid>

                            <Grid item xs={3}>
                              <Typography variant="body2" color="textSecondary">时间:</Typography>
                            </Grid>
                            <Grid item xs={9}>
                              <Typography variant="body2">
                                {formatTimestamp(tx.timestamp)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : (
                  <Alert severity="info">此区块没有包含交易。</Alert>
                )}
              </CardContent>
            </Card>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

export default BlockchainPage;