// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import AccountSettings from '@views/apps/marketing/account-settings'

const AccountTab = dynamic(() => import('@views/apps/marketing/account-settings/account'))

// Vars
const tabContentList = () => ({
  account: <AccountTab />
})

const MarketingAccountSettingsPage = () => {
  return <AccountSettings tabContentList={tabContentList()} />
}

export default MarketingAccountSettingsPage
