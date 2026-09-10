'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'

const BulkExitDialog = ({ open, onClose, selectedCount, onConfirm, loading, error }) => {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth='xs' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <i className='ri-logout-box-r-line' style={{ color: '#ff9f43', fontSize: '24px' }} />
        Exit Selected Vehicles
      </DialogTitle>
      {loading && <LinearProgress color='warning' sx={{ height: 4 }} />}
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4, gap: 2 }}>
            <CircularProgress color='warning' size={48} thickness={4} />
            <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
              Exiting {selectedCount} vehicle(s)...
            </Typography>
            <Typography variant='body2' color='text.secondary' align='center'>
              Please wait while all selected bookings are updated to completed. Do not close this window.
            </Typography>
          </Box>
        ) : (
          <>
            <DialogContentText sx={{ mb: 3 }}>
              Are you sure you want to mark <strong>{selectedCount}</strong> selected parked vehicle(s) as exited?
            </DialogContentText>

            <Box
              sx={{
                p: 3,
                borderRadius: 1,
                backgroundColor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <Typography variant='body2' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className='ri-checkbox-circle-line' style={{ color: '#28c76f' }} />
                Status will be updated to <strong>COMPLETED</strong>
              </Typography>
              <Typography variant='body2' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className='ri-time-line' style={{ color: '#666CFF' }} />
                Exit date & time will be set to current time
              </Typography>
              <Typography variant='body2' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className='ri-money-dollar-circle-line' style={{ color: '#ff9f43' }} />
                Exited amount will be recorded as <strong>₹0.00</strong>
              </Typography>
            </Box>
          </>
        )}

        {error && (
          <Alert severity='error' sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={onClose} disabled={loading} color='secondary'>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant='contained'
          color='warning'
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color='inherit' /> : <i className='ri-logout-box-r-line' />}
        >
          {loading ? 'Exiting...' : `Confirm Exit (${selectedCount})`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BulkExitDialog
