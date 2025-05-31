'use client'
import React, { useState, useEffect } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  TextField,
  MenuItem,
  Grid,
  Paper,
  Divider,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  AccountBalanceWallet,
  Receipt,
  Summarize,
  CalendarToday
} from '@mui/icons-material';

const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const Dashboard = () => {
  const [value, setValue] = useState(0);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    vendor: 'all'
  });

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = async () => {
    try {
      const response = await fetch('https://pmwapis.parkmywheels.com/admin/fetchallbookingtransactions');
      const data = await response.json();
      
      if (data.success) {
        setSummaryData(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching summary data:", error);
      setLoading(false);
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleFilterChange = (name, value) => {
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredVendors = summaryData?.vendors.filter(vendor => {
    // Vendor filter
    if (filter.vendor !== 'all' && vendor.vendorId !== filter.vendor) {
      return false;
    }
    
    return true;
  }) || [];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Tabs
        value={value}
        onChange={handleChange}
        centered
        sx={{ mb: 3 }}
      >
        <Tab label="Transaction" icon={<Summarize />} iconPosition="start" />
        <Tab label="Payouts Details" />
      </Tabs>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Start Date"
              type="date"
              value={filter.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="End Date"
              type="date"
              value={filter.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Vendor"
              value={filter.vendor}
              onChange={(e) => handleFilterChange('vendor', e.target.value)}
              fullWidth
            >
              <MenuItem value="all">All Vendors</MenuItem>
              {summaryData?.vendors.map((vendor) => (
                <MenuItem key={vendor.vendorId} value={vendor.vendorId}>
                  {vendor.vendorName} 
                  {vendor.bookingCount === 0 && (
                    <Chip 
                      label="No transactions" 
                      size="small" 
                      sx={{ ml: 1 }} 
                      variant="outlined" 
                    />
                  )}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <TabPanel value={value} index={0}>
        {summaryData && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Transaction Summary
            </Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" color="textSecondary">
                        Total Bookings
                      </Typography>
                      <Typography variant="h3">
                        {summaryData.vendors.reduce((sum, vendor) => sum + vendor.bookingCount, 0)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" color="textSecondary">
                        Total Amount
                      </Typography>
                      <Typography variant="h3" color="primary">
                        ₹{summaryData.grandTotalAmount}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" color="textSecondary">
                        Total Receivable
                      </Typography>
                      <Typography variant="h3" color="success.main">
                        ₹{summaryData.grandTotalReceivable}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>

            <Typography variant="h6" gutterBottom>
              All Vendors ({filteredVendors.length})
            </Typography>
            <Grid container spacing={2}>
              {filteredVendors.map((vendor) => (
                <Grid item xs={12} sm={6} md={4} key={vendor.vendorId}>
                  <Card sx={{ 
                    opacity: vendor.bookingCount === 0 ? 0.7 : 1,
                    border: vendor.bookingCount === 0 ? '1px dashed #ccc' : '1px solid rgba(0, 0, 0, 0.12)'
                  }}>
                    <CardContent>
                      <Typography variant="h6">
                        {vendor.vendorName}
                        {vendor.bookingCount === 0 && (
                          <Chip 
                            label="No transactions" 
                            size="small" 
                            sx={{ ml: 1 }} 
                            color="default"
                            variant="outlined"
                          />
                        )}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccountBalanceWallet sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography>Amount: ₹{vendor.totalAmount}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Receipt sx={{ mr: 1, color: 'error.main' }} />
                            <Typography>Fee: {vendor.platformFeePercentage}%</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography>Receivable: ₹{vendor.totalReceivable}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography>Bookings: {vendor.bookingCount}</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={value} index={1}>
        {summaryData && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Detailed Vendor Information
            </Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={3}>
                {filteredVendors.map((vendor) => (
                  <Grid item xs={12} key={vendor.vendorId}>
                    <Card sx={{ 
                      opacity: vendor.bookingCount === 0 ? 0.7 : 1,
                      border: vendor.bookingCount === 0 ? '1px dashed #ccc' : '1px solid rgba(0, 0, 0, 0.12)'
                    }}>
                      <CardContent>
                        <Typography variant="h6">
                          {vendor.vendorName}
                          {vendor.bookingCount === 0 && (
                            <Chip 
                              label="No transactions" 
                              size="small" 
                              sx={{ ml: 1 }} 
                              color="default"
                              variant="outlined"
                            />
                          )}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={3}>
                            <Typography>Platform Fee: {vendor.platformFeePercentage}%</Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography>Total Amount: ₹{vendor.totalAmount}</Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography>Receivable: ₹{vendor.totalReceivable}</Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography>Bookings: {vendor.bookingCount}</Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        )}
      </TabPanel>
    </Box>
  );
};

export default Dashboard;
