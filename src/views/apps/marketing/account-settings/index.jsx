'use client'

// React Imports
import { useState } from 'react'


// MUI Imports
import Grid from '@mui/material/Grid2'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'


// Component Imports
import CustomTabList from '@core/components/mui/TabList'

const AccountSettings = ({ tabContentList }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        {tabContentList['account']}
      </Grid>
    </Grid>
  )
}

export default AccountSettings
