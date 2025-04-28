// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import AboutOverview from '@/views/pages/user-profile/profile/AboutOverview'
import ActivityTimeline from '@/views/pages/user-profile/profile/ActivityTimeline'
import MySpaceDetails from '@/views/pages/user-profile/profile/MySpaceDetails'
import BusinessHoursTable from '@/views/pages/user-profile/profile/BusinessHoursTable'
import ProjectTables from '@/views/pages/user-profile/profile/ProjectsTables'


const ProfileTab = ({ data }) => {
  return (
    <Grid container spacing={6}>
         <Grid size={{ xs: 12}}>
        <ProjectTables data={data} />
      </Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <AboutOverview data={data} />
      </Grid>
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <ActivityTimeline />
          </Grid>
        </Grid>
        <Grid size={{ xs: 12 }}>
           <MySpaceDetails/>
          </Grid>
      </Grid>
      <Grid size={{ xs: 12 }}>
           <BusinessHoursTable/>
      </Grid>
    </Grid>
    
  )
}

export default ProfileTab
