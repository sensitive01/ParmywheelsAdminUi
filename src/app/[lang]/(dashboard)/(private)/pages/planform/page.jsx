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
  IconButton,
  Snackbar,
  Alert
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { styled } from '@mui/material/styles'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
})

const PlanCreationForm = () => {
  const router = useRouter()
  const [planDetails, setPlanDetails] = useState({
    planName: '',
    validity: '',
    amount: '',
    features: [''],
    status: 'disable',
    image: null
  })

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPlanDetails(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...planDetails.features]
    newFeatures[index] = value
    setPlanDetails(prev => ({
      ...prev,
      features: newFeatures
    }))
  }

  const addFeatureField = () => {
    setPlanDetails(prev => ({
      ...prev,
      features: [...prev.features, '']
    }))
  }

  const removeFeatureField = (index) => {
    const newFeatures = planDetails.features.filter((_, i) => i !== index)
    setPlanDetails(prev => ({
      ...prev,
      features: newFeatures.length ? newFeatures : ['']
    }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    setPlanDetails(prev => ({
      ...prev,
      image: file
    }))
  }

  const handleCreatePlan = async () => {
    if (!planDetails.planName || !planDetails.validity || 
        !planDetails.amount || !planDetails.image) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      })
      return
    }
    const formData = new FormData()
    formData.append('planName', planDetails.planName)
    formData.append('validity', planDetails.validity)
    formData.append('amount', planDetails.amount)
    planDetails.features.forEach((feature, index) => {
      if (feature.trim()) {
        formData.append('features', feature.trim())
      }
    })

    formData.append('status', planDetails.status)
    formData.append('image', planDetails.image)

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/createplan`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setSnackbar({
        open: true,
        message: 'Plan created successfully!',
        severity: 'success'
      })
      setTimeout(() => {
        router.push('/en/pages/pricing')
      }, 500)

    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error creating plan',
        severity: 'error'
      })
      console.error('Plan creation error:', error)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  return (
    <Box sx={{ 
      backgroundColor: '#329a73', 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: 2 
    }}>
      <Card sx={{ 
        width: '100%', 
        maxWidth: 500, 
        borderRadius: 3 
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography 
            variant="h5" 
            component="h1" 
            sx={{ 
              mb: 3, 
              textAlign: 'center', 
              color: '#329a73' 
            }}
          >
            Create New Plan
          </Typography>

          <TextField
            fullWidth
            label="Plan Name"
            name="planName"
            value={planDetails.planName}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Validity (in days)"
            name="validity"
            type="number"
            value={planDetails.validity}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Amount"
            name="amount"
            type="number"
            value={planDetails.amount}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: '₹'
            }}
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Features
          </Typography>
          {planDetails.features.map((feature, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TextField
                fullWidth
                label="Feature"
                name="feature"
                variant="outlined"
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                sx={{ mr: 1 }}
              />
              {index === planDetails.features.length - 1 && (
                <IconButton onClick={addFeatureField} color="primary">
                  <AddCircleOutlineIcon />
                </IconButton>
              )}
              {planDetails.features.length > 1 && (
                <IconButton onClick={() => removeFeatureField(index)} color="error">
                  <DeleteOutlineIcon />
                </IconButton>
              )}
            </Box>
          ))}

          <FormControl component="fieldset" sx={{ mb: 2, width: '100%', mt: 2 }}>
            <FormLabel component="legend">Plan Status</FormLabel>
            <RadioGroup
              row
              name="status"
              value={planDetails.status}
              onChange={handleInputChange}
            >
              <FormControlLabel 
                value="enable" 
                control={<Radio />} 
                label="Enable" 
              />
              <FormControlLabel 
                value="disable" 
                control={<Radio />} 
                label="Disable" 
              />
            </RadioGroup>
          </FormControl>
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              mt: 2, 
              mb: 2, 
              backgroundColor: '#329a73',
              '&:hover': {
                backgroundColor: '#3d8b40'
              }
            }}
          >
            Upload Plan Image
            <VisuallyHiddenInput 
              type="file" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </Button>
          {planDetails.image && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {planDetails.image.name}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={handleCreatePlan}
            sx={{ 
              mt: 2, 
              backgroundColor: '#329a73',
              borderRadius: 2,
              py: 1.5,
              '&:hover': {
                backgroundColor: '#3d8b40'
              }
            }}
          >
            Create Plan
          </Button>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </CardContent>
      </Card>
    </Box>
  )
}

export default PlanCreationForm
