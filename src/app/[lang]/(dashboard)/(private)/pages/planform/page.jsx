'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  Alert,
  Select,
  MenuItem,
  InputLabel,
  CircularProgress
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
  const searchParams = useSearchParams()
  const planId = searchParams.get('id')
  const isEditMode = !!planId
  
  const [loading, setLoading] = useState(isEditMode)
  const [planDetails, setPlanDetails] = useState({
    planName: '',
    role: '',
    validity: '',
    amount: '',
    features: [''],
    status: 'disable',
    image: null
  })
  
  const [imagePreview, setImagePreview] = useState('')
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  useEffect(() => {
    if (planId) {
      fetchPlanDetails()
    }
  }, [planId])

  const fetchPlanDetails = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/getplanbyid/${planId}`)
      
      const planData = response.data.plan

      setPlanDetails({
        planName: planData.planName || '',
        role: planData.role || '',
        validity: planData.validity || '',
        amount: planData.amount || '',
        features: Array.isArray(planData.features) 
          ? planData.features 
          : (planData.features ? planData.features.split(',').map(f => f.trim()) : ['']),
        status: planData.status || 'disable',
        image: null
      })

      if (planData.image) {
        setImagePreview(planData.image)
      }
      
      setLoading(false)
    } catch (error) {
      setLoading(false)
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error fetching plan details',
        severity: 'error'
      })
      console.error('Error fetching plan details:', error)
    }
  }

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
    if (file) {
      setPlanDetails(prev => ({
        ...prev,
        image: file
      }))
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const validateForm = () => {
    if (!planDetails.planName || !planDetails.role || !planDetails.validity || !planDetails.amount) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      })
      return false
    }
    if (!isEditMode && !planDetails.image) {
      setSnackbar({
        open: true,
        message: 'Please upload an image',
        severity: 'error'
      })
      return false
    }
    
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    const formData = new FormData()

    formData.append('planName', planDetails.planName)
    formData.append('role', planDetails.role)
    formData.append('validity', planDetails.validity)
    formData.append('amount', planDetails.amount)
    planDetails.features.forEach((feature, index) => {
      if (feature.trim()) {
        formData.append('features', feature.trim())
      }
    })

    formData.append('status', planDetails.status)
    if (planDetails.image) {
      formData.append('image', planDetails.image)
    }

    try {
      let response
      
      if (isEditMode) {
        response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/updateplan/${planId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        setSnackbar({
          open: true,
          message: 'Plan updated successfully!',
          severity: 'success'
        })
      } else {
        response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/createplan`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        setSnackbar({
          open: true,
          message: 'Plan created successfully!',
          severity: 'success'
        })
      }
      
      setTimeout(() => {
        router.push('/en/pages/pricing')
      }, 1500)

    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || `Error ${isEditMode ? 'updating' : 'creating'} plan`,
        severity: 'error'
      })
      console.error(`Plan ${isEditMode ? 'update' : 'creation'} error:`, error)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  if (loading) {
    return (
      <Box sx={{ 
        backgroundColor: '#329a73', 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center'
      }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    )
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
            {isEditMode ? 'Edit Plan' : 'Create New Plan'}
          </Typography>

          <TextField
            fullWidth
            label="Plan Name"
            name="planName"
            value={planDetails.planName}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              name="role"
              value={planDetails.role}
              label="Role *"
              onChange={handleInputChange}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="vendor">Vendor</MenuItem>
            </Select>
          </FormControl>

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
          
          {imagePreview && (
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
              <Box
                component="img"
                src={imagePreview}
                alt="Plan image preview"
                sx={{ 
                  width: '150px', 
                  height: '150px', 
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: '1px solid #ddd'
                }}
              />
            </Box>
          )}
          


          
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
            {isEditMode ? 'Change Plan Image' : 'Upload Plan Image'}
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
            onClick={handleSubmit}
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
            {isEditMode ? 'Update Plan' : 'Create Plan'}
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
