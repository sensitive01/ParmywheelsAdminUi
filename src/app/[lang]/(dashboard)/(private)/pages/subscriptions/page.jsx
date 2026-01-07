'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import axios from 'axios'
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Snackbar,
  Alert
} from '@mui/material'

const SubscriptionForm = () => {
  const router = useRouter()

  const [subscriptionDetails, setSubscriptionDetails] = useState({
    userId: '',
    planId: '',
    planTitle: '',
    price: '',
    autoRenew: true,
    expiresAt: '',
    cardNumber: '',
    cardHolderName: '',
    expiry: '',
    cvv: ''
  })

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setSubscriptionDetails(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCreateSubscription = async () => {
    if (!subscriptionDetails.userId || !subscriptionDetails.planId || !subscriptionDetails.planTitle ||
      !subscriptionDetails.price || !subscriptionDetails.expiresAt ||
      !subscriptionDetails.cardNumber || !subscriptionDetails.cardHolderName ||
      !subscriptionDetails.expiry || !subscriptionDetails.cvv) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      })

      return
    }

    try {
      const response = await axios.post('https://api.parkmywheels.com/admin/subscription', {
        userId: subscriptionDetails.userId,
        planId: subscriptionDetails.planId,
        planTitle: subscriptionDetails.planTitle,
        price: Number(subscriptionDetails.price),
        autoRenew: subscriptionDetails.autoRenew,
        expiresAt: new Date(subscriptionDetails.expiresAt),
        paymentDetails: {
          cardNumber: subscriptionDetails.cardNumber,
          cardHolderName: subscriptionDetails.cardHolderName,
          expiry: subscriptionDetails.expiry,
          cvv: subscriptionDetails.cvv
        }
      })

      setSnackbar({
        open: true,
        message: 'Subscription created successfully!',
        severity: 'success'
      })
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error creating subscription',
        severity: 'error'
      })
    }
  }

  return (
    <Box sx={{ backgroundColor: '#f4f4f4', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 500, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
            Create Subscription
          </Typography>

          <TextField fullWidth label="User ID" name="userId" value={subscriptionDetails.userId} onChange={handleInputChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Plan ID" name="planId" value={subscriptionDetails.planId} onChange={handleInputChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Plan Title" name="planTitle" value={subscriptionDetails.planTitle} onChange={handleInputChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Price" name="price" type="number" value={subscriptionDetails.price} onChange={handleInputChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Expiration Date" name="expiresAt" type="date" value={subscriptionDetails.expiresAt} onChange={handleInputChange} sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />

          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend">Auto Renew</FormLabel>
            <RadioGroup row name="autoRenew" value={subscriptionDetails.autoRenew} onChange={(e) => setSubscriptionDetails({ ...subscriptionDetails, autoRenew: e.target.value === 'true' })}>
              <FormControlLabel value={true} control={<Radio />} label="Yes" />
              <FormControlLabel value={false} control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>

          <Typography variant="subtitle1" sx={{ mb: 1 }}>Payment Details</Typography>
          <TextField fullWidth label="Card Number" name="cardNumber" value={subscriptionDetails.cardNumber} onChange={handleInputChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Card Holder Name" name="cardHolderName" value={subscriptionDetails.cardHolderName} onChange={handleInputChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Expiry Date (MM/YY)" name="expiry" value={subscriptionDetails.expiry} onChange={handleInputChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="CVV" name="cvv" type="number" value={subscriptionDetails.cvv} onChange={handleInputChange} sx={{ mb: 2 }} />

          <Button fullWidth variant="contained" onClick={handleCreateSubscription} sx={{ mt: 2, borderRadius: 2, py: 1.5 }}>
            Create Subscription
          </Button>

          <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SubscriptionForm
