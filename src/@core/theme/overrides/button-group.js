// Config Imports
import themeConfig from '@configs/themeConfig'

const buttonGroup = {
  MuiButtonGroup: {
    defaultProps: {
      disableRipple: themeConfig.disableRipple
    },
    styleOverrides: {
      root: {
        variants: [
          {
            props: { variant: 'text', color: 'primary' },
            style: {
              '& .MuiButtonGroup-firstButton, & .MuiButtonGroup-middleButton': {
                '&, &.Mui-disabled': {
                  borderColor: 'var(--mui-palette-primary-main)'
                }
              }
            }
          },
          {
            props: { variant: 'text', color: 'secondary' },
            style: {
              '& .MuiButtonGroup-firstButton, & .MuiButtonGroup-middleButton': {
                '&, &.Mui-disabled': {
                  borderColor: 'var(--mui-palette-secondary-main)'
                }
              }
            }
          },
          {
            props: { variant: 'text', color: 'error' },
            style: {
              '& .MuiButtonGroup-firstButton, & .MuiButtonGroup-middleButton': {
                '&, &.Mui-disabled': {
                  borderColor: 'var(--mui-palette-error-main)'
                }
              }
            }
          },
          {
            props: { variant: 'text', color: 'warning' },
            style: {
              '& .MuiButtonGroup-firstButton, & .MuiButtonGroup-middleButton': {
                '&, &.Mui-disabled': {
                  borderColor: 'var(--mui-palette-warning-main)'
                }
              }
            }
          },
          {
            props: { variant: 'text', color: 'info' },
            style: {
              '& .MuiButtonGroup-firstButton, & .MuiButtonGroup-middleButton': {
                '&, &.Mui-disabled': {
                  borderColor: 'var(--mui-palette-info-main)'
                }
              }
            }
          },
          {
            props: { variant: 'text', color: 'success' },
            style: {
              '& .MuiButtonGroup-firstButton, & .MuiButtonGroup-middleButton': {
                '&, &.Mui-disabled': {
                  borderColor: 'var(--mui-palette-success-main)'
                }
              }
            }
          }
        ]
      },
      contained: ({ ownerState }) => ({
        boxShadow: 'var(--mui-customShadows-xs)',
        ...(ownerState.disabled && {
          boxShadow: 'none'
        })
      })
    }
  }
}

export default buttonGroup
