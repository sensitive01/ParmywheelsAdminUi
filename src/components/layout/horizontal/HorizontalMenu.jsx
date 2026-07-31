// Next Imports
import { useParams, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

// MUI Imports
import { useTheme } from '@mui/material/styles'
import Chip from '@mui/material/Chip'

// Component Imports
import HorizontalNav, { Menu, SubMenu, MenuItem } from '@menu/horizontal-menu'
import VerticalNavContent from './VerticalNavContent'

// import { GenerateHorizontalMenu } from '@components/GenerateMenu'
// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledHorizontalNavExpandIcon from '@menu/styles/horizontal/StyledHorizontalNavExpandIcon'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/horizontal/menuItemStyles'
import menuRootStyles from '@core/styles/horizontal/menuRootStyles'
import verticalMenuItemStyles from '@core/styles/vertical/menuItemStyles'
import verticalNavigationCustomStyles from '@core/styles/vertical/navigationCustomStyles'

const RenderExpandIcon = ({ level }) => (
  <StyledHorizontalNavExpandIcon level={level}>
    <i className='ri-arrow-right-s-line' />
  </StyledHorizontalNavExpandIcon>
)

const RenderVerticalExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const HorizontalMenu = ({ dictionary }) => {
  // Hooks
  const verticalNavOptions = useVerticalNav()
  const theme = useTheme()
  const params = useParams()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  
  let userRole = session?.user?.role;
  if (status === 'loading') {
    if (pathname?.includes('/marketing')) userRole = 'Marketing';
    else if (pathname?.includes('/employee')) userRole = 'Employee';
    else userRole = 'Admin';
  } else {
    userRole = userRole || 'Admin';
  }

  // Vars
  const { transitionDuration } = verticalNavOptions
  const { lang: locale } = params

  return (
    <HorizontalNav
      switchToVertical
      verticalNavContent={VerticalNavContent}
      verticalNavProps={{
        customStyles: verticalNavigationCustomStyles(verticalNavOptions, theme),
        backgroundColor: 'var(--mui-palette-background-default)'
      }}
    >
      <Menu
        rootStyles={menuRootStyles(theme)}
        renderExpandIcon={({ level }) => <RenderExpandIcon level={level} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
        menuItemStyles={menuItemStyles(theme, 'ri-circle-fill')}
        popoutMenuOffset={{
          mainAxis: ({ level }) => (level && level > 0 ? 4 : 14),
          alignmentAxis: 0
        }}
        verticalMenuProps={{
          menuItemStyles: verticalMenuItemStyles(verticalNavOptions, theme),
          renderExpandIcon: ({ open }) => (
            <RenderVerticalExpandIcon open={open} transitionDuration={transitionDuration} />
          ),
          renderExpandedMenuItemIcon: { icon: <i className='ri-circle-fill' /> }
        }}
      >
        {userRole === 'Marketing' ? (
          <>
            <MenuItem href={`/${locale}/apps/marketing/attendance`} icon={<i className='ri-camera-line' />}>
              Attendance
            </MenuItem>
            <MenuItem href={`/${locale}/apps/marketing/leaves`} icon={<i className='ri-calendar-event-line' />}>
              Leaves
            </MenuItem>
            <MenuItem href={`/${locale}/apps/marketing/leads`} icon={<i className='ri-contacts-book-2-line' />}>
              Leads
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem href={`/${locale}/dashboards/crm`} icon={<i className='ri-home-smile-line' />}>
          {dictionary['navigation'].dashboards}
        </MenuItem>
        <SubMenu label={dictionary['navigation'].vendor}>
          <MenuItem href={`/${locale}/apps/parking/vendors/list`}>{dictionary['navigation'].ListVendors}</MenuItem>
          <MenuItem href={`/${locale}/apps/employees/list`}>Employees</MenuItem>
          <MenuItem href={`/${locale}/apps/leads/list`}>Leads</MenuItem>
          <MenuItem href={`/${locale}/pages/kyconboarding`}>{dictionary['navigation'].KYCVerification}</MenuItem>
          <MenuItem href={`/${locale}/pages/vendor-bank-verification`}>
            {dictionary['navigation'].bankDetailsVerification}
          </MenuItem>
        </SubMenu>
        <SubMenu label={dictionary['navigation'].orders}>
          {/* <MenuItem href={`/${locale}/apps/parking/bookings/list`}>{dictionary['navigation'].list}</MenuItem> */}
          <MenuItem href={`/${locale}/apps/parking/bookings/list`}>{dictionary['navigation'].orders}</MenuItem>
          <MenuItem href={`/${locale}/apps/parking/valet-drivers/list`}>Valet Drivers</MenuItem>
          <MenuItem href={`/${locale}/pages/faq`}>{dictionary['navigation'].faq}</MenuItem>
          <MenuItem href={`/${locale}/pages/settlement`}>{dictionary['navigation'].settlement}</MenuItem>
          {/* <MenuItem href={`/${locale}/pages/wizard-examples/property-listing`}>
            {dictionary['navigation'].propertyListing}
          </MenuItem> */}
        </SubMenu>
        <SubMenu label={dictionary['navigation'].customers}>
          <MenuItem href={`/${locale}/apps/parking/customers/list`}>{dictionary['navigation'].customers}</MenuItem>
          <MenuItem href={`/${locale}/pages/myspace`}>{dictionary['navigation'].myspace}</MenuItem>
          <MenuItem href={`/${locale}/pages/customer-handling-fee`}>
            {dictionary['navigation'].customerHandlingFee}
          </MenuItem>
        </SubMenu>
        <SubMenu label={dictionary['navigation'].otherservices}>
          <MenuItem href={`/${locale}/pages/corporate-solutionstable`}>{dictionary['navigation'].calendar}</MenuItem>
          <MenuItem href={`/${locale}/pages/Commercial-table`}>{dictionary['navigation'].kanban}</MenuItem>
        </SubMenu>
        <MenuItem href={`/${locale}/pages/pricing`} icon={<i className='ri-money-dollar-circle-line' />}>
          {dictionary['navigation'].Premiumplans}
        </MenuItem>
        <MenuItem href={`/${locale}/pages/auth-logs`} icon={<i className='ri-shield-keyhole-line' />}>
          {dictionary['navigation'].authLogs}
        </MenuItem>
        </>
        )}

        {/* <SubMenu label={dictionary['navigation'].pages} icon={<i className='ri-file-list-2-line' />}>
          <MenuItem href={`/${locale}/pages/account-settings`} icon={<i className='ri-user-settings-line' />}>
            {dictionary['navigation'].accountSettings}
          </MenuItem>
          <MenuItem href={`/${locale}/pages/subscriptiontable`} icon={<i className='ri-user-settings-line' />}>
            {dictionary['navigation'].Subscriptions}
          </MenuItem>
          <MenuItem href={`/${locale}/pages/faq`} icon={<i className='ri-question-line' />}>
            {dictionary['navigation'].faq}
          </MenuItem>
          <MenuItem href={`/${locale}/pages/pricing`} icon={<i className='ri-money-dollar-circle-line' />}>
            {dictionary['navigation'].pricing}
          </MenuItem>
          <MenuItem href={`/${locale}/pages/kyconboarding`} icon={<i className='ri-money-dollar-circle-line' />}>
            {dictionary['navigation'].kyconboarding}
          </MenuItem>
          <MenuItem href={`/${locale}/pages/settlement`} icon={<i className='ri-user-line' />}>
            {dictionary['navigation'].settlement}
          </MenuItem>
        </SubMenu> */}
        {/* <MenuItem href={`/${locale}/pages/notifications`} icon={<i className='ri-notification-3-line' style={{ color: '#black', fontSize: '24px' }} />} />
        <MenuItem href={`/${locale}/pages/search`} icon={<i className='ri-search-line' style={{ color: '#black', fontSize: '24px' }} />}>
        </MenuItem> */}
      </Menu>
    </HorizontalNav>
  )
}

export default HorizontalMenu
