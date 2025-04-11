'use client'

import { useState, useEffect } from 'react'

import { DataGrid } from '@mui/x-data-grid'
import { Box, Typography, Snackbar, Alert, Button, TextField } from '@mui/material'
import axios from 'axios'

const KycDataTable = () => {
  const [kycData, setKycData] = useState([])
  const [searchText, setSearchText] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchKycData()
  }, [])

  const fetchKycData = async () => {
    try {
      const response = await axios.get('https://parkmywheelsapi.onrender.com/vendor/getallkyc')

      const formattedData = response.data.data.map((item) => ({
        ...item,
        id: item._id,
      }))

      setKycData(formattedData)
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error fetching KYC data',
        severity: 'error'
      })
    }
  }

  const verifyKyc = async (vendorId) => {
    try {
      await axios.put(`https://parkmywheelsapi.onrender.com/vendor/verifykyc/${vendorId}`)
      setKycData(prevData => prevData.map(item => item.vendorId === vendorId ? { ...item, status: 'Verified' } : item))
      setSnackbar({ open: true, message: 'KYC verified successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error verifying KYC',
        severity: 'error'
      })
    }
  }

  const handleSearch = (event) => {
    setSearchText(event.target.value)
  }

  const filteredData = kycData.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  )

  const columns = [
    { field: 'vendorId', headerName: 'Vendor ID', width: 150 },
    { field: 'idProof', headerName: 'ID Proof', width: 150 },
    { field: 'idProofNumber', headerName: 'ID Proof Number', width: 150 },
    {
      field: 'idProofImage',
      headerName: 'ID Proof Image',
      width: 200,
      renderCell: (params) => (
        <img src={params.value} alt="ID Proof" width={50} height={50} />
      )
    },
    { field: 'addressProof', headerName: 'Address Proof', width: 150 },
    { field: 'addressProofNumber', headerName: 'Address Proof Number', width: 150 },
    {
      field: 'addressProofImage',
      headerName: 'Address Proof Image',
      width: 200,
      renderCell: (params) => (
        <img src={params.value} alt="Address Proof" width={50} height={50} />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          color={params.value === 'Verified' ? 'success' : 'error'}
          onClick={() => verifyKyc(params.row.vendorId)}
          disabled={params.value === 'Verified'}
        >
          {params.value === 'Verified' ? 'Verified' : 'Not Verified'}
        </Button>
      )
    }
  ]

  return (
    <Box sx={{ height: 500, width: '100%', padding: 2 }}>
      <Typography variant="h3" sx={{ mb: 2, textAlign: 'center' }}>KYC Details</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchText}
          onChange={handleSearch}
          size="small"
        />
      </Box>
      <DataGrid 
        rows={filteredData} 
        columns={columns} 
        pageSize={5} 
        checkboxSelection 
      />
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default KycDataTable
