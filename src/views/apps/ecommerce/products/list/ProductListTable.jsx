'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

import Link from 'next/link'

import { useParams , useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

// Next Imports
// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Alert from '@mui/material/Alert'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CloseIcon from '@mui/icons-material/Close'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import InfoIcon from '@mui/icons-material/Info'
import ContactsIcon from '@mui/icons-material/Contacts'
import SubscriptionsIcon from '@mui/icons-material/Subscriptions'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Status color mapping for vendor status
export const statusChipColor = {
  approved: { color: 'success' },
  pending: { color: 'warning' },
  rejected: { color: 'error' },
  suspended: { color: '#666CFF' }
};

// Place type icon mapping
export const placeTypeIcons = {
  mall: { icon: 'ri-store-3-line', color: '#ff4d49' },
  apartment: { icon: 'ri-building-line', color: '#72e128' },
  commercial: { icon: 'ri-building-4-line', color: '#fdb528' },
  hospital: { icon: 'ri-hospital-line', color: '#00cfe8' },
  default: { icon: 'ri-map-pin-line', color: '#282a42' }
};

// Day name mapping
const dayNames = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday"
};

// Format time from 24h to 12h format
const formatTime = (time) => {
  if (!time) return 'Closed';
  
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  
  return `${formattedHour}:${minutes} ${period}`;
};

// Vendor Detail Modal Component
const VendorDetailModal = ({ open, handleClose, vendorId }) => {
  const [vendorData, setVendorData] = useState(null);
  const [businessHours, setBusinessHours] = useState([]);
  const [parkingCharges, setParkingCharges] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoursLoading, setHoursLoading] = useState(false);
  const [chargesLoading, setChargesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const fetchVendorDetails = async () => {
      if (!vendorId || !open) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_URL}/vendor/fetch-vendor-data?id=${vendorId}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setVendorData(data.data);
      } catch (err) {
        console.error("Failed to fetch vendor details:", err);
        setError(err.message || "Failed to fetch vendor details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendorDetails();
  }, [vendorId, open]);

  // Fetch business hours
  useEffect(() => {
    const fetchBusinessHours = async () => {
      if (!vendorData?.vendorId) return;
      
      setHoursLoading(true);
      
      try {
        const response = await fetch(`${API_URL}/vendor/fetchbusinesshours/${vendorData.vendorId}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching business hours: ${response.status}`);
        }
        
        const data = await response.json();
        setBusinessHours(data.businessHours || []);
      } catch (err) {
        console.error("Failed to fetch business hours:", err);
      } finally {
        setHoursLoading(false);
      }
    };
    
    fetchBusinessHours();
  }, [vendorData]);

  // Fetch parking charges
  useEffect(() => {
    const fetchParkingCharges = async () => {
      if (!vendorData?.vendorId) return;
      
      setChargesLoading(true);
      
      try {
        const response = await fetch(`${API_URL}/vendor/getchargesdata/${vendorData.vendorId}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching parking charges: ${response.status}`);
        }
        
        const data = await response.json();
        setParkingCharges(data.vendor || null);
      } catch (err) {
        console.error("Failed to fetch parking charges:", err);
      } finally {
        setChargesLoading(false);
      }
    };
    
    fetchParkingCharges();
  }, [vendorData]);

  // Render contact information
  const renderContacts = () => {
    if (!vendorData?.contacts || vendorData.contacts.length === 0) {
      return <Typography>No contact information available</Typography>;
    }
    
    return (
      <Box sx={{ mt: 2 }}>
        {vendorData.contacts.map((contact, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: '#f9f9f9' }}>
            <Typography variant="subtitle1" fontWeight="bold">{contact.name}</Typography>
            <Typography variant="body2">Mobile: {contact.mobile}</Typography>
            {contact.email && <Typography variant="body2">Email: {contact.email}</Typography>}
            {contact.designation && <Typography variant="body2">Role: {contact.designation}</Typography>}
          </Paper>
        ))}
      </Box>
    );
  };

  // Render subscription information
  const renderSubscription = () => {
    if (!vendorData) return null;
    
    const isSubscribed = vendorData.subscription === "true";
    const endDate = vendorData.subscriptionenddate 
      ? new Date(vendorData.subscriptionenddate).toLocaleDateString() 
      : 'N/A';
    
    return (
      <Box sx={{ mt: 2 }}>
        <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
          <Typography variant="subtitle1" fontWeight="bold">Subscription Status</Typography>
          <Chip
            label={isSubscribed ? "Active" : "Inactive"}
            variant="filled"
            size="small"
            color={isSubscribed ? "success" : "default"}
            sx={{ mt: 1, mb: 1 }}
          />
          {isSubscribed && (
            <>
              <Typography variant="body2">Days Remaining: {vendorData.subscriptionleft || 0}</Typography>
              <Typography variant="body2">End Date: {endDate}</Typography>
              {vendorData.subscriptionplan && (
                <Typography variant="body2">Plan: {vendorData.subscriptionplan}</Typography>
              )}
              {vendorData.trial === "true" && (
                <Chip label="Trial" size="small" color="info" sx={{ mt: 1 }} />
              )}
              {vendorData.platformfee && (
                <Typography variant="body2" sx={{ mt: 1 }}>Platform Fee: {vendorData.platformfee}</Typography>
              )}
            </>
          )}
        </Paper>
      </Box>
    );
  };
  
  // Render parking information
  const renderParking = () => {
    if (!vendorData?.parkingEntries || vendorData.parkingEntries.length === 0) {
      return <Typography>No parking information available</Typography>;
    }
    
    return (
      <Box sx={{ mt: 2 }}>
        <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
          <Typography variant="subtitle1" fontWeight="bold">Parking Capacity</Typography>
          <Box sx={{ mt: 1 }}>
            {vendorData.parkingEntries.map((entry, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <i 
                  className={entry.type?.toLowerCase() === 'bike' ? 'ri-motorbike-fill' : 'ri-car-fill'} 
                  style={{ 
                    fontSize: '18px', 
                    color: entry.type?.toLowerCase() === 'bike' ? '#72e128' : '#ff4d49',
                    marginRight: '8px'
                  }}
                />
                <Typography variant="body1">
                  {entry.type}: <strong>{entry.count}</strong>
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    );
  };

  // Render business hours
  const renderBusinessHours = () => {
    if (hoursLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      );
    }
    
    if (!businessHours || businessHours.length === 0) {
      return <Alert severity="info">No business hours information available</Alert>;
    }
    
    // Sort business hours by day
    const sortedHours = [...businessHours].sort((a, b) => a.day - b.day);
    
    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell><strong>Day</strong></TableCell>
              <TableCell><strong>Opening Time</strong></TableCell>
              <TableCell><strong>Closing Time</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedHours.map((hours, index) => (
              <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>{dayNames[hours.day]}</TableCell>
                <TableCell>{formatTime(hours.openTime)}</TableCell>
                <TableCell>{formatTime(hours.closeTime)}</TableCell>
                <TableCell align="center">
                  <Chip 
                    label={hours.closed ? "Closed" : "Open"} 
                    color={hours.closed ? "default" : "success"} 
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Render parking charges
  const renderParkingCharges = () => {
    if (chargesLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      );
    }
    
    if (!parkingCharges) {
      return <Alert severity="info">No parking charges information available</Alert>;
    }
    
    return (
      <Box sx={{ mt: 2 }}>
        {parkingCharges.carCharges || parkingCharges.bikeCharges ? (
          <>
            {parkingCharges.carCharges && (
              <Paper sx={{ p: 2, mb: 2, bgcolor: '#f9f9f9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <i className="ri-car-fill" style={{ fontSize: '20px', color: '#ff4d49' }}></i>
                  <Typography variant="subtitle1" fontWeight="bold">Car Charges</Typography>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f3f3f3' }}>
                        <TableCell>Time Range</TableCell>
                        <TableCell align="right">Charge (₹)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {parkingCharges.carCharges.map((charge, index) => (
                        <TableRow key={index}>
                          <TableCell>{charge.time} {charge.time === 1 ? 'Hour' : 'Hours'}</TableCell>
                          <TableCell align="right">₹{charge.price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
            
            {parkingCharges.bikeCharges && (
              <Paper sx={{ p: 2, mb: 2, bgcolor: '#f9f9f9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <i className="ri-motorbike-fill" style={{ fontSize: '20px', color: '#72e128' }}></i>
                  <Typography variant="subtitle1" fontWeight="bold">Bike Charges</Typography>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f3f3f3' }}>
                        <TableCell>Time Range</TableCell>
                        <TableCell align="right">Charge (₹)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {parkingCharges.bikeCharges.map((charge, index) => (
                        <TableRow key={index}>
                          <TableCell>{charge.time} {charge.time === 1 ? 'Hour' : 'Hours'}</TableCell>
                          <TableCell align="right">₹{charge.price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </>
        ) : (
          <Alert severity="info">No parking charges defined</Alert>
        )}
      </Box>
    );
  };

  // Render location information
  const renderLocation = () => {
    if (!vendorData) return null;
    
    return (
      <Box sx={{ mt: 2 }}>
        <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
          <Typography variant="subtitle1" fontWeight="bold">Location Details</Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Address</Typography>
              <Typography variant="body1">{vendorData.address || 'N/A'}</Typography>
            </Grid>
            
            {vendorData.landMark && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Landmark</Typography>
                <Typography variant="body1">{vendorData.landMark}</Typography>
              </Grid>
            )}
            
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Latitude</Typography>
              <Typography variant="body1">{vendorData.latitude || 'N/A'}</Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Longitude</Typography>
              <Typography variant="body1">{vendorData.longitude || 'N/A'}</Typography>
            </Grid>
          </Grid>
          
          {vendorData.latitude && vendorData.longitude && (
            <Button 
              variant="outlined" 
              color="primary" 
              size="small" 
              startIcon={<LocationOnIcon />} 
              sx={{ mt: 2 }}
              component="a"
              href={`https://www.google.com/maps?q=${vendorData.latitude},${vendorData.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Map
            </Button>
          )}
        </Paper>
      </Box>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Vendor Details
          <IconButton aria-label="close" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : vendorData ? (
          <>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              {vendorData.image ? (
                <img
                  src={vendorData.image}
                  alt={vendorData.vendorName}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <CustomAvatar skin='light' size={64}>
                  {getInitials(vendorData.vendorName || '')}
                </CustomAvatar>
              )}
              <Box>
                <Typography variant="h6">{vendorData.vendorName}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Chip
                    label={vendorData.status || 'Pending'}
                    variant="filled"
                    size="small"
                    color={
                      vendorData.status === 'approved' ? 'success' :
                      vendorData.status === 'rejected' ? 'error' :
                      vendorData.status === 'suspended' ? 'default' : 'warning'
                    }
                  />
                  <Chip
                    label={`ID: ${vendorData.vendorId}`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="vendor details tabs" 
              sx={{ mb: 2 }}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<InfoIcon fontSize="small" />} iconPosition="start" label="Basic Info" />
              <Tab icon={<ContactsIcon fontSize="small" />} iconPosition="start" label="Contacts" />
              <Tab icon={<LocationOnIcon fontSize="small" />} iconPosition="start" label="Location" />
              <Tab icon={<AccessTimeIcon fontSize="small" />} iconPosition="start" label="Business Hours" />
              <Tab icon={<DirectionsCarIcon fontSize="small" />} iconPosition="start" label="Parking" />
              <Tab icon={<MonetizationOnIcon fontSize="small" />} iconPosition="start" label="Charges" />
              <Tab icon={<SubscriptionsIcon fontSize="small" />} iconPosition="start" label="Subscription" />
            </Tabs>
            
            {/* Basic Info Tab */}
            {tabValue === 0 && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Vendor ID</Typography>
                    <Typography variant="body1">#{vendorData.vendorId || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Space ID</Typography>
                    <Typography variant="body1">{vendorData.spaceid || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Creation Date</Typography>
                    <Typography variant="body1">
                      {vendorData.createdAt ? new Date(vendorData.createdAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                    <Typography variant="body1">
                      {vendorData.updatedAt ? new Date(vendorData.updatedAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Grid>
                  {vendorData.email && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{vendorData.email}</Typography>
                    </Grid>
                  )}
                  {vendorData.mobile && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">Mobile</Typography>
                      <Typography variant="body1">{vendorData.mobile}</Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Typography variant="body1">{vendorData.status || 'Pending'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">MongoDB ID</Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{vendorData._id || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Contacts Tab */}
            {tabValue === 1 && renderContacts()}
            
            {/* Location Tab */}
            {tabValue === 2 && renderLocation()}
            
            {/* Business Hours Tab */}
            {tabValue === 3 && renderBusinessHours()}
            
            {/* Parking Tab */}
            {tabValue === 4 && renderParking()}
            
            {/* Charges Tab */}
            {tabValue === 5 && renderParkingCharges()}
            
            {/* Subscription Tab */}
            {tabValue === 6 && renderSubscription()}
          </>
        ) : (
          <Typography>No vendor data available</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({
    itemRank
  })
  
  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return (
    <TextField
      {...props}
      value={value}
      onChange={e => setValue(e.target.value)}
      size="small"
    />
  );
};

const columnHelper = createColumnHelper()

const VendorListTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const { lang: locale } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  const [vendorLoading, setVendorLoading] = useState({});
  const [vendorStatusMap, setVendorStatusMap] = useState({});
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(null);

  const handleOpenModal = (vendorId) => {
    setSelectedVendorId(vendorId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/vendor/all-vendors`)
      const result = await response.json()

      if (result && result.data) {
        setData(result.data)
        setFilteredData(result.data)
      } else {
        setData([])
        setFilteredData([])
      }
    } catch (error) {
      console.error("Error fetching vendor data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [])

  // Function to update vendor status
  const updateVendorStatus = async (vendorId, newStatus) => {
    setVendorLoading(prev => ({ ...prev, [vendorId]: true }));

    try {
      const endpoint = newStatus === 'approved' 
        ? `${API_URL}/vendor/approve/${vendorId}` 
        : `${API_URL}/vendor/updateStatus/${vendorId}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update vendor status');

      setVendorStatusMap(prev => ({ ...prev, [vendorId]: newStatus }));

      return true;
    } catch (error) {
      console.error('Error updating vendor status:', error);

      return false;
    } finally {
      setVendorLoading(prev => ({ ...prev, [vendorId]: false }));
    }
  };

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        )
      },
      columnHelper.accessor('vendorId', {
        header: 'Vendor ID',
        cell: ({ row }) => <Typography style={{ color: '#666cff' }}>#{row.original.vendorId}</Typography>
      }),
      columnHelper.accessor('vendorName', {
        header: 'Vendor Name',
        cell: ({ row }) => {
          const vendor = row.original;
          const imgSrc = vendor.image || "https://demos.pixinvent.com/materialize-nextjs-admin-template/demo-1/images/avatars/1.png";
          
          return (
            <div className="flex items-center gap-3">
              {vendor.image ? (
                <img
                  src={imgSrc}
                  alt="Vendor Avatar"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <CustomAvatar skin='light' size={34}>
                  {getInitials(vendor.vendorName)}
                </CustomAvatar>
              )}
              
              <div className="flex flex-col">
                <Typography className="font-medium">{vendor.vendorName}</Typography>
                <Typography variant="body2">{vendor.spaceid}</Typography>
              </div>
            </div>
          );
        }
      }),
      columnHelper.accessor('contacts', {
        header: 'Contact Info',
        cell: ({ row }) => {
          const contacts = row.original.contacts || [];
          const primaryContact = contacts[0] || { name: 'N/A', mobile: 'N/A' };
          
          return (
            <div className="flex flex-col">
              <Typography className="font-medium">{primaryContact.name}</Typography>
              <Typography variant="body2">{primaryContact.mobile}</Typography>
              {contacts.length > 1 && (
                <Typography variant="caption" color="text.secondary">
                  +{contacts.length - 1} more contacts
                </Typography>
              )}
            </div>
          );
        }
      }),
      columnHelper.accessor('address', {
        header: 'Address',
        cell: ({ row }) => {
          const placeType = row.original.address?.toLowerCase() || 'default';
          const { icon, color } = placeTypeIcons[placeType] || placeTypeIcons.default;
          
          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className={icon} style={{ fontSize: '16px', color }}></i>
              {row.original.address || 'Unknown'}
            </Typography>
          );
        }
      }),
 
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const vendorId = row.original._id;
          const isLoading = vendorLoading[vendorId] || false;
          const currentStatus = vendorStatusMap[vendorId] || row.original.status || 'pending';
      
          const toggleStatus = async () => {
            if (isLoading || currentStatus !== 'pending') return;
      
            const success = await updateVendorStatus(vendorId, 'approved');
      
            if (!success) {
              // Optional: rollback or show toast
            }
          };
      
          const chipStyles = {
            backgroundColor: currentStatus === 'pending' ? '#ff4d4f' : '#52c41a',
            color: 'white',
            cursor: currentStatus === 'pending' ? 'pointer' : 'default',
            opacity: isLoading ? 0.7 : 1,
            '&:hover': currentStatus === 'pending' ? { 
              backgroundColor: '#ff7875', 
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)' 
            } : {}
          };
      
          const chip = (
            <Chip
              label={isLoading ? '...' : (currentStatus || 'Pending')}
              variant="tonal"
              size="small"
              sx={chipStyles}
              onClick={currentStatus === 'pending' ? toggleStatus : undefined}
            />
          );
      
          return currentStatus === 'pending' ? (
            <Tooltip title="Click to approve">{chip}</Tooltip>
          ) : chip;
        }
      }),
      
      columnHelper.accessor('subscription', {
        header: 'Subscription',
        cell: ({ row }) => {
          const isSubscribed = row.original.subscription === "true";
          const daysLeft = row.original.subscriptionleft || "0";

          const endDate = row.original.subscriptionenddate 
            ? new Date(row.original.subscriptionenddate).toLocaleDateString() 
            : 'N/A';
          
          return (
            <div className="flex flex-col">
              <Chip
                label={isSubscribed ? "Active" : "Inactive"}
                variant="tonal"
                size="small"
                color={isSubscribed ? "success" : "default"}
              />
              {isSubscribed && (
                <Typography variant="caption">
                  {daysLeft} days left • Ends: {endDate}
                </Typography>
              )}
            </div>
          );
        }
      }),
      columnHelper.accessor('parkingEntries', {
        header: 'Parking Capacity',
        cell: ({ row }) => {
          const parkingEntries = row.original.parkingEntries || [];
          
          if (parkingEntries.length === 0) {
            return <Typography variant="body2">No entries</Typography>;
          }
          
          return (
            <div className="flex flex-col gap-1">
              {parkingEntries.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <i className={entry.type?.toLowerCase() === 'bike' ? 'ri-motorbike-fill' : 'ri-car-fill'} 
                     style={{ fontSize: '14px', color: entry.type?.toLowerCase() === 'bike' ? '#72e128' : '#ff4d49' }}></i>
                  <Typography variant="body2">
                    {entry.type}: <strong>{entry.count}</strong>
                  </Typography>
                </div>
              ))}
            </div>
          );
        }
      }),
      // New column for View button
      columnHelper.accessor('actions', {
        header: 'Actions',
        cell: ({ row }) => {
          return (
            <Button
              variant="outlined"
              size="small"
              color="primary"
              startIcon={<VisibilityIcon />}
              onClick={() => handleOpenModal(row.original._id)}
            >
              View
            </Button>
          );
        }
      })
    ],
    [data, filteredData, vendorLoading, vendorStatusMap]
  );

  const table = useReactTable({
    data: filteredData.length > 0 || globalFilter ? filteredData : data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  });

  return (
    <Card>
      <CardHeader title='Vendor Management' />
      <Divider />
      <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Search Vendors'
          className='sm:is-auto'
        />
      </CardContent>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='ri-arrow-up-s-line text-xl' />,
                            desc: <i className='ri-arrow-down-s-line text-xl' />
                          }[header.column.getIsSorted()] ?? null}
                        </div>
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {table.getFilteredRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  {loading ? 'Loading vendor data...' : 'No vendors found'}
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })}
            </tbody>
          )}
        </table>
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component='div'
        className='border-bs'
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        SelectProps={{
          inputProps: { 'aria-label': 'rows per page' }
        }}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
      />
      
      {/* Vendor Detail Modal */}
      <VendorDetailModal 
        open={modalOpen}
        handleClose={handleCloseModal}
        vendorId={selectedVendorId}
      />
    </Card>
  )
}

export default VendorListTable
