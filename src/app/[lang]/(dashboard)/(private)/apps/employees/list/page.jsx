'use client'

import { useState } from 'react'
import Grid from '@mui/material/Grid2'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Card from '@mui/material/Card'

import EmployeeListTable from '@views/apps/employees/list/EmployeeListTable'
import AttendanceTable from '@views/apps/employees/list/AttendanceTable'
import LeavesTable from '@views/apps/employees/list/LeavesTable'

const EmployeesPage = () => {
  const [value, setValue] = useState('1')

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} size={{xs: 12}}>
        <Card>
          <TabContext value={value}>
            <div className='border-b'>
              <TabList onChange={handleChange} aria-label='employee management tabs' className='px-4 pt-2'>
                <Tab label='Employees' value='1' />
                <Tab label='Attendance' value='2' />
                <Tab label='Leaves' value='3' />
              </TabList>
            </div>
            <TabPanel value='1' className='p-0'>
              <EmployeeListTable />
            </TabPanel>
            <TabPanel value='2' className='p-0'>
              <AttendanceTable />
            </TabPanel>
            <TabPanel value='3' className='p-0'>
              <LeavesTable />
            </TabPanel>
          </TabContext>
        </Card>
      </Grid>
    </Grid>
  )
}

export default EmployeesPage
