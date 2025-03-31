// 'use client'

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import axios from 'axios';
// import { DataGrid } from '@mui/x-data-grid';
// import { 
//   Card, 
//   CardContent, 
//   Typography, 
//   TextField, 
//   Button, 
//   Dialog,
//   DialogContent,
//   DialogActions,
//   IconButton,
//   Drawer,
//   Box,
//   Tab,
//   Tabs,
//   Grid,
//   Paper,
//   Chip,
//   Avatar
// } from '@mui/material';
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
// import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
// import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
// import BookmarkIcon from '@mui/icons-material/Bookmark';
// import LocalOfferIcon from '@mui/icons-material/LocalOffer';
// import SecurityIcon from '@mui/icons-material/Security';
// import LocationOnIcon from '@mui/icons-material/LocationOn';
// import NotificationsIcon from '@mui/icons-material/Notifications';

// const UserDataTable = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [open, setOpen] = useState(false);
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [formData, setFormData] = useState({
//     userName: "",
//     userEmail: "",
//     userMobile: "",
//     userPassword: ""
//   });
//   const [formLoading, setFormLoading] = useState(false);
//   const [currentTab, setCurrentTab] = useState(0);
//   const router = useRouter();

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = () => {
//     setLoading(true);
//     axios.get('https://parkmywheelsapi.onrender.com/allusers')
//       .then(response => {
//         setUsers(response.data.users);
//         setFilteredUsers(response.data.users);
//         setLoading(false);
//       })
//       .catch(error => {
//         console.error('Error fetching users:', error);
//         setLoading(false);
//       });
//   };

//   const handleSearch = () => {
//     const filtered = users.filter(user => 
//       user.userName?.toLowerCase().includes(search.toLowerCase()) ||
//       user.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
//       user.userMobile?.includes(search) ||
//       user.role?.toLowerCase().includes(search.toLowerCase()) ||
//       user.status?.toLowerCase().includes(search.toLowerCase()) ||
//       user.walletstatus?.toLowerCase().includes(search.toLowerCase()) ||
//       user.vehicleNo?.toLowerCase().includes(search.toLowerCase())
//     );
//     setFilteredUsers(filtered);
//   };

//   const handleView = (user) => {
//     setSelectedUser(user);
//     setOpen(true);
//   };

//   const handleClose = () => {
//     setOpen(false);
//     setSelectedUser(null);
//   };

//   const handleDrawerOpen = () => {
//     setDrawerOpen(true);
//   };

//   const handleDrawerClose = () => {
//     setDrawerOpen(false);
//     setFormData({
//       userName: "",
//       userEmail: "",
//       userMobile: "",
//       userPassword: ""
//     });
//   };

//   const handleFormChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     setFormLoading(true);
//     try {
//       const response = await axios.post("https://parkmywheelsapi.onrender.com/signup", formData);
//       alert(response.data.message);
//       handleDrawerClose();
//       fetchUsers();
//     } catch (error) {
//       alert(error.response?.data?.message || "Something went wrong");
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   const handleTabChange = (event, newValue) => {
//     setCurrentTab(newValue);
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { 
//       year: 'numeric', 
//       month: 'long', 
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     }) + ' (ET)';
//   };

//   const columns = [
//     { field: 'id', headerName: 'ID', width: 90 },
//     { field: 'userName', headerName: 'Name', width: 150 },
//     { field: 'userEmail', headerName: 'Email', width: 200 },
//     { field: 'userMobile', headerName: 'Mobile', width: 150 },
//     { field: 'role', headerName: 'Role', width: 120 },
//     { field: 'status', headerName: 'Status', width: 120 },
//     { field: 'walletamount', headerName: 'Wallet Amount', width: 150 },
//     { field: 'walletstatus', headerName: 'Wallet Status', width: 150 },
//     { field: 'vehicleNo', headerName: 'Vehicle No', width: 150 },
//     { 
//       field: 'image', 
//       headerName: 'Profile Image', 
//       width: 150, 
//       renderCell: (params) => (
//         params.value ? <img src={params.value} alt='Profile' style={{ width: 50, height: 50, borderRadius: '50%' }} /> : null
//       )
//     },
//     { field: 'createdAt', headerName: 'Created At', width: 200 },
//     { 
//       field: 'view', 
//       headerName: 'View', 
//       width: 100, 
//       renderCell: (params) => (
//         <IconButton onClick={() => handleView(params.row)}>
//           <VisibilityIcon color='primary' />
//         </IconButton>
//       )
//     }
//   ];

//   const rows = filteredUsers.map((user, index) => ({ id: index + 1, ...user }));

//   return (
//     <Card>
//       <CardContent>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
//           <Typography variant='h6' gutterBottom>
//             User List
//           </Typography>
//           <Button
//             variant='contained'
//             onClick={handleDrawerOpen}
//             startIcon={<i className='ri-add-line' />}
//             sx={{ backgroundColor: '#329a73' }}
//           >
//             Add Customer
//           </Button>
//         </div>
//         <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
//           <TextField
//             label='Search'
//             variant='outlined'
//             size='small'
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//           <Button variant='contained' onClick={handleSearch}>Search</Button>
//         </div>
//         <div style={{ height: 400, width: '100%' }}>
//           <DataGrid
//             rows={rows}
//             columns={columns}
//             pageSize={10}
//             loading={loading}
//           />
//         </div>
//       </CardContent>
      
//       {/* Enhanced User Details Dialog */}
//       <Dialog 
//         open={open} 
//         onClose={handleClose}
//         maxWidth="lg"
//         fullWidth
//       >
//         {selectedUser && (
//           <DialogContent>
//             <Box sx={{ mb: 2 }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Typography variant="h5">
//                   Customer ID #{selectedUser.id}
//                 </Typography>
//                 <Button variant="outlined" color="error" sx={{ borderRadius: '4px' }}>
//                   Delete Customer
//                 </Button>
//               </div>
//               <Typography variant="body2" color="text.secondary">
//                 {formatDate(selectedUser.createdAt)}
//               </Typography>
//             </Box>

//             <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
//               <Tabs value={currentTab} onChange={handleTabChange} aria-label="customer details tabs">
//                 <Tab icon={<Avatar sx={{ bgcolor: '#329a73', width: 24, height: 24 }}><i className="ri-user-line" style={{ fontSize: '14px', color: 'white' }}/></Avatar>} iconPosition="start" label="Overview" />
//                 <Tab icon={<SecurityIcon fontSize="small" />} iconPosition="start" label="Security" />
//                 <Tab icon={<LocationOnIcon fontSize="small" />} iconPosition="start" label="Address & Billing" />
//                 <Tab icon={<NotificationsIcon fontSize="small" />} iconPosition="start" label="Notifications" />
//               </Tabs>
//             </Box>

//             {currentTab === 0 && (
//               <Box>
//                 <Grid container spacing={3}>
//                   <Grid item xs={12} md={4}>
//                     <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', height: '100%' }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
//                         <Avatar
//                           src={selectedUser.image || '/avatar-placeholder.png'}
//                           sx={{ width: 120, height: 120, mb: 2 }}
//                         />
//                         <Typography variant="h6">{selectedUser.userName || 'N/A'}</Typography>
//                         <Typography variant="body2" color="text.secondary">
//                           Customer ID #{selectedUser.id}
//                         </Typography>
//                       </Box>
                      
//                       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
//                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                           <ShoppingCartIcon sx={{ color: '#329a73', mr: 1 }} />
//                           <Typography variant="body2">Orders</Typography>
//                         </Box>
//                         <Typography variant="body1" fontWeight="bold">
//                           {selectedUser.orders || '157'}
//                         </Typography>
//                       </Box>
                      
//                       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                           <AccountBalanceWalletIcon sx={{ color: '#329a73', mr: 1 }} />
//                           <Typography variant="body2">Spent</Typography>
//                         </Box>
//                         <Typography variant="body1" fontWeight="bold">
//                           ${selectedUser.totalSpent || '2074.22'}
//                         </Typography>
//                       </Box>
//                     </Paper>
//                   </Grid>
                  
//                   <Grid item xs={12} md={8}>
//                     <Grid container spacing={3}>
//                       <Grid item xs={12} md={6}>
//                         <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', height: '100%' }}>
//                           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                             <Avatar sx={{ bgcolor: '#e3f2fd', mr: 2 }}>
//                               <AccountBalanceWalletIcon sx={{ color: '#2196f3' }} />
//                             </Avatar>
//                             <Typography variant="h6">Account Balance</Typography>
//                           </Box>
//                           <Typography variant="h5" color="#329a73" sx={{ mb: 1 }}>
//                             ${selectedUser.walletamount || '7480'}
//                           </Typography>
//                           <Typography variant="body2" color="text.secondary">
//                             Credit Left
//                           </Typography>
//                           <Typography variant="body2" color="text.secondary">
//                             Account balance for next purchase
//                           </Typography>
//                         </Paper>
//                       </Grid>
                      
//                       <Grid item xs={12} md={6}>
//                         <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', height: '100%' }}>
//                           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                             <Avatar sx={{ bgcolor: '#e8f5e9', mr: 2 }}>
//                               <CardGiftcardIcon sx={{ color: '#4caf50' }} />
//                             </Avatar>
//                             <Typography variant="h6">Loyalty Program</Typography>
//                           </Box>
//                           <Chip 
//                             label="Platinum member" 
//                             sx={{ 
//                               bgcolor: '#e8f5e9', 
//                               color: '#4caf50', 
//                               mb: 1 
//                             }} 
//                           />
//                           <Typography variant="body2" color="text.secondary">
//                             3000 points to next tier
//                           </Typography>
//                         </Paper>
//                       </Grid>
                      
//                       <Grid item xs={12} md={6}>
//                         <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', height: '100%' }}>
//                           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                             <Avatar sx={{ bgcolor: '#fff8e1', mr: 2 }}>
//                               <BookmarkIcon sx={{ color: '#ffc107' }} />
//                             </Avatar>
//                             <Typography variant="h6">Wishlist</Typography>
//                           </Box>
//                           <Typography variant="body2" color="text.secondary">
//                             {selectedUser.wishlistItems || '12'} items in wishlist
//                           </Typography>
//                         </Paper>
//                       </Grid>
                      
//                       <Grid item xs={12} md={6}>
//                         <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', height: '100%' }}>
//                           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                             <Avatar sx={{ bgcolor: '#e0f7fa', mr: 2 }}>
//                               <LocalOfferIcon sx={{ color: '#00bcd4' }} />
//                             </Avatar>
//                             <Typography variant="h6">Coupons</Typography>
//                           </Box>
//                           <Typography variant="body2" color="text.secondary">
//                             {selectedUser.coupons || '4'} available coupons
//                           </Typography>
//                         </Paper>
//                       </Grid>
//                     </Grid>
//                   </Grid>
                  
//                   <Grid item xs={12}>
//                     <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0' }}>
//                       <Typography variant="h6" sx={{ mb: 2 }}>Details</Typography>
//                       <Grid container spacing={2}>
//                         <Grid item xs={12} md={4}>
//                           <Typography variant="body2" color="text.secondary">Email</Typography>
//                           <Typography variant="body1">{selectedUser.userEmail || 'N/A'}</Typography>
//                         </Grid>
//                         <Grid item xs={12} md={4}>
//                           <Typography variant="body2" color="text.secondary">Mobile</Typography>
//                           <Typography variant="body1">{selectedUser.userMobile || 'N/A'}</Typography>
//                         </Grid>
//                         <Grid item xs={12} md={4}>
//                           <Typography variant="body2" color="text.secondary">Role</Typography>
//                           <Typography variant="body1">{selectedUser.role || 'Customer'}</Typography>
//                         </Grid>
//                         <Grid item xs={12} md={4}>
//                           <Typography variant="body2" color="text.secondary">Status</Typography>
//                           <Chip 
//                             label={selectedUser.status || 'Active'} 
//                             sx={{ 
//                               bgcolor: selectedUser.status?.toLowerCase() === 'active' ? '#e8f5e9' : '#ffebee', 
//                               color: selectedUser.status?.toLowerCase() === 'active' ? '#4caf50' : '#f44336' 
//                             }} 
//                           />
//                         </Grid>
//                         <Grid item xs={12} md={4}>
//                           <Typography variant="body2" color="text.secondary">Wallet Status</Typography>
//                           <Typography variant="body1">{selectedUser.walletstatus || 'Active'}</Typography>
//                         </Grid>
//                         <Grid item xs={12} md={4}>
//                           <Typography variant="body2" color="text.secondary">Vehicle No</Typography>
//                           <Typography variant="body1">{selectedUser.vehicleNo || 'N/A'}</Typography>
//                         </Grid>
//                       </Grid>
//                     </Paper>
//                   </Grid>
//                 </Grid>
//               </Box>
//             )}

//             {currentTab === 1 && (
//               <Box sx={{ p: 3 }}>
//                 <Typography variant="h6">Security Settings</Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Security settings and credentials management content would appear here.
//                 </Typography>
//               </Box>
//             )}

//             {currentTab === 2 && (
//               <Box sx={{ p: 3 }}>
//                 <Typography variant="h6">Address & Billing Information</Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Address and billing details would appear here.
//                 </Typography>
//               </Box>
//             )}

//             {currentTab === 3 && (
//               <Box sx={{ p: 3 }}>
//                 <Typography variant="h6">Notification Preferences</Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Notification settings and preferences would appear here.
//                 </Typography>
//               </Box>
//             )}
//           </DialogContent>
//         )}
//         <DialogActions>
//           <Button onClick={handleClose} color="primary">Close</Button>
//         </DialogActions>
//       </Dialog>

//       {/* Customer Add Form Drawer */}
//       <Drawer
//         anchor="right"
//         open={drawerOpen}
//         onClose={handleDrawerClose}
//         sx={{
//           '& .MuiDrawer-paper': {
//             width: 400,
//             padding: 2,
//             boxSizing: 'border-box',
//           },
//         }}
//       >
//         <Card sx={{ boxShadow: 'none', height: '100%' }}>
//           <CardContent>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
//               <Typography variant='h6' gutterBottom>
//                 Add New Customer
//               </Typography>
//               <Button onClick={handleDrawerClose}>Close</Button>
//             </div>
//             <form onSubmit={handleFormSubmit}>
//               <TextField
//                 label='Name'
//                 name='userName'
//                 value={formData.userName}
//                 onChange={handleFormChange}
//                 fullWidth
//                 margin='normal'
//                 required
//               />
//               <TextField
//                 label='Email'
//                 name='userEmail'
//                 type='email'
//                 value={formData.userEmail}
//                 onChange={handleFormChange}
//                 fullWidth
//                 margin='normal'
//               />
//               <TextField
//                 label='Mobile'
//                 name='userMobile'
//                 value={formData.userMobile}
//                 onChange={handleFormChange}
//                 fullWidth
//                 margin='normal'
//                 required
//               />
//               <TextField
//                 label='Password'
//                 name='userPassword'
//                 type='password'
//                 value={formData.userPassword}
//                 onChange={handleFormChange}
//                 fullWidth
//                 margin='normal'
//                 required
//               />
//               <Button 
//                 type='submit' 
//                 variant='contained' 
//                 color='primary' 
//                 disabled={formLoading} 
//                 sx={{ marginTop: 2, backgroundColor: '#329a73' }}
//                 fullWidth
//               >
//                 {formLoading ? "Registering..." : "Register"}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>
//       </Drawer>
//     </Card>
//   );
// };

// export default UserDataTable;


'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Drawer,
  Box,
  Tab,
  Tabs,
  Grid,
  Paper,
  Chip,
  Avatar,
  InputAdornment
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SecurityIcon from '@mui/icons-material/Security';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NotificationsIcon from '@mui/icons-material/Notifications';

const UserDataTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    userMobile: "",
    userPassword: "",
    confirmPassword: "",
    otp: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    axios.get('https://parkmywheelsapi.onrender.com/allusers')
      .then(response => {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        setLoading(false);
      });
  };

  const handleSearch = () => {
    const filtered = users.filter(user => 
      user.userName?.toLowerCase().includes(search.toLowerCase()) ||
      user.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      user.userMobile?.includes(search) ||
      user.role?.toLowerCase().includes(search.toLowerCase()) ||
      user.status?.toLowerCase().includes(search.toLowerCase()) ||
      user.walletstatus?.toLowerCase().includes(search.toLowerCase()) ||
      user.vehicleNo?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setFormData({
      userName: "",
      userEmail: "",
      userMobile: "",
      userPassword: "",
      confirmPassword: "",
      otp: ""
    });
    setPasswordError("");
    setOtpSent(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear password error when either password field changes
    if (name === 'userPassword' || name === 'confirmPassword') {
      setPasswordError("");
    }
  };

  const validatePasswords = () => {
    if (formData.userPassword !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSendOTP = async () => {
    // Validate email and mobile before sending OTP
    if (!formData.userEmail || !formData.userMobile) {
      alert("Email and mobile number are required to send OTP");
      return;
    }
    
    setFormLoading(true);
    try {
      // This would be your actual API call to send OTP
      // const response = await axios.post("https://parkmywheelsapi.onrender.com/sendotp", {
      //   email: formData.userEmail,
      //   mobile: formData.userMobile
      // });
      
      // For demonstration, simulating OTP sent
      setTimeout(() => {
        setOtpSent(true);
        setFormLoading(false);
        alert("OTP sent successfully to your mobile and email");
      }, 1000);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send OTP");
      setFormLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (!validatePasswords()) {
      return;
    }
    
    // Validate OTP field is filled
    if (!formData.otp) {
      alert("Please enter the OTP sent to your email/mobile");
      return;
    }
    
    setFormLoading(true);
    try {
      // Remove confirmPassword from data sent to API
      const { confirmPassword, ...submissionData } = formData;
      
      const response = await axios.post("https://parkmywheelsapi.onrender.com/signup", submissionData);
      alert(response.data.message);
      handleDrawerClose();
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setFormLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' (ET)';
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'userName', headerName: 'Name', width: 150 },
    { field: 'userEmail', headerName: 'Email', width: 200 },
    { field: 'userMobile', headerName: 'Mobile', width: 150 },
    { field: 'role', headerName: 'Role', width: 120 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'walletamount', headerName: 'Wallet Amount', width: 150 },
    { field: 'walletstatus', headerName: 'Wallet Status', width: 150 },
    { field: 'vehicleNo', headerName: 'Vehicle No', width: 150 },
    { 
      field: 'image', 
      headerName: 'Profile Image', 
      width: 150, 
      renderCell: (params) => (
        params.value ? <img src={params.value} alt='Profile' style={{ width: 50, height: 50, borderRadius: '50%' }} /> : null
      )
    },
    { field: 'createdAt', headerName: 'Created At', width: 200 },
    { 
      field: 'view', 
      headerName: 'View', 
      width: 100, 
      renderCell: (params) => (
        <IconButton onClick={() => handleView(params.row)}>
          <VisibilityIcon color='primary' />
        </IconButton>
      )
    }
  ];

  const rows = filteredUsers.map((user, index) => ({ id: index + 1, ...user }));

  return (
    <Card>
      <CardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <Typography variant='h6' gutterBottom>
            User List
          </Typography>
          <Button
            variant='contained'
            onClick={handleDrawerOpen}
            startIcon={<i className='ri-add-line' />}
            sx={{ backgroundColor: '#329a73' }}
          >
            Add Customer
          </Button>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <TextField
            label='Search'
            variant='outlined'
            size='small'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant='contained' onClick={handleSearch}>Search</Button>
        </div>
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            loading={loading}
          />
        </div>
      </CardContent>
      
      {/* Enhanced User Details Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
      >
        {selectedUser && (
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">
                  Customer ID #{selectedUser.id}
                </Typography>
                <Button variant="outlined" color="error" sx={{ borderRadius: '4px' }}>
                  Delete Customer
                </Button>
              </div>
              <Typography variant="body2" color="text.secondary">
                {formatDate(selectedUser.createdAt)}
              </Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={currentTab} onChange={handleTabChange} aria-label="customer details tabs">
                <Tab icon={<Avatar sx={{ bgcolor: '#329a73', width: 24, height: 24 }}><i className="ri-user-line" style={{ fontSize: '14px', color: 'white' }}/></Avatar>} iconPosition="start" label="Profile" />
                <Tab icon={<SecurityIcon fontSize="small" />} iconPosition="start" label="My Space" />
                <Tab icon={<LocationOnIcon fontSize="small" />} iconPosition="start" label="My space bookings" />
                <Tab icon={<NotificationsIcon fontSize="small" />} iconPosition="start" label="Notifications" />
              </Tabs>
            </Box>

            {currentTab === 0 && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', height: '100%' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          src={selectedUser.image || '/avatar-placeholder.png'}
                          sx={{ width: 120, height: 120, mb: 2 }}
                        />
                        <Typography variant="h6">{selectedUser.userName || 'N/A'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Customer ID #{selectedUser.id}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ShoppingCartIcon sx={{ color: '#329a73', mr: 1 }} />
                          <Typography variant="body2">Orders</Typography>
                        </Box>
                        <Typography variant="body1" fontWeight="bold">
                          {selectedUser.orders || '157'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccountBalanceWalletIcon sx={{ color: '#329a73', mr: 1 }} />
                          <Typography variant="body2">Spent</Typography>
                        </Box>
                        <Typography variant="body1" fontWeight="bold">
                          ${selectedUser.totalSpent || '2074.22'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={8}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', height: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: '#e3f2fd', mr: 2 }}>
                              <AccountBalanceWalletIcon sx={{ color: '#2196f3' }} />
                            </Avatar>
                            <Typography variant="h6">Account Balance</Typography>
                          </Box>
                          <Typography variant="h5" color="#329a73" sx={{ mb: 1 }}>
                            ${selectedUser.walletamount || '7480'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Credit Left
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Account balance for next purchase
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', height: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: '#e8f5e9', mr: 2 }}>
                              <CardGiftcardIcon sx={{ color: '#4caf50' }} />
                            </Avatar>
                            <Typography variant="h6">Loyalty Program</Typography>
                          </Box>
                          <Chip 
                            label="Platinum member" 
                            sx={{ 
                              bgcolor: '#e8f5e9', 
                              color: '#4caf50', 
                              mb: 1 
                            }} 
                          />
                          <Typography variant="body2" color="text.secondary">
                            3000 points to next tier
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', height: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: '#fff8e1', mr: 2 }}>
                              <BookmarkIcon sx={{ color: '#ffc107' }} />
                            </Avatar>
                            <Typography variant="h6">Wishlist</Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {selectedUser.wishlistItems || '12'} items in wishlist
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', height: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: '#e0f7fa', mr: 2 }}>
                              <LocalOfferIcon sx={{ color: '#00bcd4' }} />
                            </Avatar>
                            <Typography variant="h6">Coupons</Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {selectedUser.coupons || '4'} available coupons
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>Details</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">Email</Typography>
                          <Typography variant="body1">{selectedUser.userEmail || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">Mobile</Typography>
                          <Typography variant="body1">{selectedUser.userMobile || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">Role</Typography>
                          <Typography variant="body1">{selectedUser.role || 'Customer'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">Status</Typography>
                          <Chip 
                            label={selectedUser.status || 'Active'} 
                            sx={{ 
                              bgcolor: selectedUser.status?.toLowerCase() === 'active' ? '#e8f5e9' : '#ffebee', 
                              color: selectedUser.status?.toLowerCase() === 'active' ? '#4caf50' : '#f44336' 
                            }} 
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">Wallet Status</Typography>
                          <Typography variant="body1">{selectedUser.walletstatus || 'Active'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">Vehicle No</Typography>
                          <Typography variant="body1">{selectedUser.vehicleNo || 'N/A'}</Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {currentTab === 1 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6">Security Settings</Typography>
                <Typography variant="body2" color="text.secondary">
                  Security settings and credentials management content would appear here.
                </Typography>
              </Box>
            )}

            {currentTab === 2 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6">Address & Billing Information</Typography>
                <Typography variant="body2" color="text.secondary">
                  Address and billing details would appear here.
                </Typography>
              </Box>
            )}

            {currentTab === 3 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6">Notification Preferences</Typography>
                <Typography variant="body2" color="text.secondary">
                  Notification settings and preferences would appear here.
                </Typography>
              </Box>
            )}
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Customer Add Form Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 400,
            padding: 2,
            boxSizing: 'border-box',
          },
        }}
      >
        <Card sx={{ boxShadow: 'none', height: '100%' }}>
          <CardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <Typography variant='h6' gutterBottom>
                Add New Customer
              </Typography>
              <Button onClick={handleDrawerClose}>Close</Button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <TextField
                label='Name'
                name='userName'
                value={formData.userName}
                onChange={handleFormChange}
                fullWidth
                margin='normal'
                required
              />
              <TextField
                label='Email'
                name='userEmail'
                type='email'
                value={formData.userEmail}
                onChange={handleFormChange}
                fullWidth
                margin='normal'
                required
              />
              <TextField
                label='Mobile'
                name='userMobile'
                value={formData.userMobile}
                onChange={handleFormChange}
                fullWidth
                margin='normal'
                required
              />
              <TextField
                label='Password'
                name='userPassword'
                type='password'
                value={formData.userPassword}
                onChange={handleFormChange}
                fullWidth
                margin='normal'
                required
              />
              <TextField
                label='Confirm Password'
                name='confirmPassword'
                type='password'
                value={formData.confirmPassword}
                onChange={handleFormChange}
                fullWidth
                margin='normal'
                required
                error={!!passwordError}
                helperText={passwordError}
              />
              
              <Box sx={{ display: 'flex', gap: 1, mt: 2, mb: 1 }}>
                <TextField
                  label='OTP'
                  name='otp'
                  value={formData.otp}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  disabled={!otpSent}
                  placeholder="Enter verification code"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SecurityIcon fontSize="small" /></InputAdornment>,
                  }}
                />
                <Button 
                  variant='outlined'
                  onClick={handleSendOTP}
                  disabled={formLoading || otpSent}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {otpSent ? "OTP Sent" : "Send OTP"}
                </Button>
              </Box>
              
              <Button 
                type='submit' 
                variant='contained' 
                color='primary' 
                disabled={formLoading || !otpSent} 
                sx={{ marginTop: 2, backgroundColor: '#329a73' }}
                fullWidth
              >
                {formLoading ? "Registering..." : "Register"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Drawer>
    </Card>
  );
};

export default UserDataTable;
