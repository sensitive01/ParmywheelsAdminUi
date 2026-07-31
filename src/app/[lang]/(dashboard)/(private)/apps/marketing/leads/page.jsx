import Grid from '@mui/material/Grid2'
import LeadListTable from '@views/apps/leads/list/LeadListTable'

const MarketingLeadsPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12} size={12}>
        <LeadListTable />
      </Grid>
    </Grid>
  )
}

export default MarketingLeadsPage
