import Grid from '@mui/material/Grid2'
import ProductListTable from '@views/apps/parking/vendors/list/ProductListTable'
import ProductCard from '@views/apps/parking/vendors/list/ProductCard'

const MarketingVendorList = async () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ProductCard />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ProductListTable />
      </Grid>
    </Grid>
  )
}

export default MarketingVendorList
