import Grid from '@mui/material/Grid2'
import ProductListTable from '@views/apps/parking/vendors/list/ProductListTable'
import ProductCard from '@views/apps/parking/vendors/list/ProductCard'
import { getEcommerceData } from '@/app/server/actions'

const MarketingVendorList = async () => {
  const data = await getEcommerceData()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ProductCard />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ProductListTable productData={data?.products} />
      </Grid>
    </Grid>
  )
}

export default MarketingVendorList
