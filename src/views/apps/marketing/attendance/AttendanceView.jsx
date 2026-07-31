'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Webcam from 'react-webcam'
import { useSession } from 'next-auth/react'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import AddLineIcon from '@mui/icons-material/Add'
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import TextField from '@mui/material/TextField'
import { DataGrid } from '@mui/x-data-grid'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const AttendanceView = () => {
  const { data: session } = useSession()
  const webcamRef = useRef(null)
  const [imgSrc, setImgSrc] = useState(null)
  const [loading, setLoading] = useState(false)
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isFilterApplied, setIsFilterApplied] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [logoutDialog, setLogoutDialog] = useState(false)
  const [viewDialog, setViewDialog] = useState(false)
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const [selectedViewRecord, setSelectedViewRecord] = useState(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetchMyAttendance()
    }
  }, [session])

  const fetchMyAttendance = async (clearFilters = false) => {
    try {
      const params = new URLSearchParams()
      params.append('employeeId', session.user.id)
      if (!clearFilters && startDate) params.append('startDate', startDate)
      if (!clearFilters && endDate) params.append('endDate', endDate)

      const res = await fetch(`${API_URL}/admin/attendance?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setAttendanceRecords(json.data || [])
      }
    } catch (err) {
      console.error('Error fetching attendance:', err)
    }
  }

  const handleApplyFilter = () => {
    setIsFilterApplied(true)
    fetchMyAttendance()
  }

  const handleClearFilter = () => {
    setStartDate('')
    setEndDate('')
    setIsFilterApplied(false)
    fetchMyAttendance(true)
  }

  const todayStr = new Date().toLocaleDateString();
  const hasAttendedToday = attendanceRecords.some(record => new Date(record.date).toLocaleDateString() === todayStr);

  const formatTime = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleSetLogoutClick = (id) => {
    setSelectedRecordId(id)
    setLogoutDialog(true)
  }

  const handleSetLogout = async () => {
    setLogoutDialog(false)
    if (!selectedRecordId) return
    try {
      const res = await fetch(`${API_URL}/admin/attendance/${selectedRecordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setLogout: true })
      })

      if (res.ok) {
        fetchMyAttendance()
      } else {
        const errorData = await res.json()
        alert(`Error: ${errorData.message}`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot()
    setImgSrc(imageSrc)
  }, [webcamRef])

  const retake = () => {
    setImgSrc(null)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setImgSrc(null)
  }

  const submitAttendance = async (status) => {
    if (!imgSrc) {
      alert("Please capture your photo first.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(imgSrc)
      const blob = await res.blob()

      const formData = new FormData()
      formData.append('employeeId', session.user.id)
      formData.append('date', new Date().toISOString())
      formData.append('status', status)
      formData.append('image', blob, 'attendance.jpg')

      const response = await fetch(`${API_URL}/admin/attendance`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        alert(`Successfully marked as ${status}`)
        handleCloseDialog()
        fetchMyAttendance()
      } else {
        const errData = await response.json()
        alert(`Error: ${errData.message}`)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert("Failed to submit attendance")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-none border p-4">
      <div className="flex flex-col gap-6">
        <Typography variant="h4" className="font-bold text-center">My Attendance History</Typography>

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="flex items-end gap-3 flex-1 justify-start">
            <TextField
              size="small"
              type="date"
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <TextField
              size="small"
              type="date"
              label="End Date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={handleApplyFilter} style={{ height: '40px' }}>
              Apply Filter
            </Button>
            {isFilterApplied && (
              <Button variant="outlined" color="secondary" onClick={handleClearFilter} style={{ height: '40px' }}>
                Clear Filter
              </Button>
            )}
          </div>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddLineIcon />}
            onClick={() => setOpenDialog(true)}
            disabled={hasAttendedToday}
          >
            {hasAttendedToday ? "Already Checked In" : "Add Attendance"}
          </Button>
        </div>

        <div className="mt-4 w-full">
          <DataGrid
            autoHeight
            rows={attendanceRecords.map((r, i) => ({ ...r, id: r._id, sno: i + 1 }))}
            columns={[
              { field: 'sno', headerName: 'S.No', width: 70 },
              {
                field: 'employeeName',
                headerName: 'Employee name',
                flex: 1,
                minWidth: 150,
                renderCell: (params) => <div className='font-semibold'>{params.row.employeeId?.userName || 'Unknown'}</div>
              },
              {
                field: 'photoUrl',
                headerName: 'Photo',
                width: 100,
                renderCell: (params) => params.value ? (
                  <img src={params.value} alt="attendance" className="w-10 h-10 rounded-full object-cover border my-1" />
                ) : '-'
              },
              {
                field: 'date',
                headerName: 'Date',
                width: 150,
                renderCell: (params) => new Date(params.row.date).toLocaleDateString()
              },
              {
                field: 'loginTime',
                headerName: 'Login Time',
                width: 150,
                renderCell: (params) => params.row.loginTime || params.row.createdAt ? formatTime(params.row.loginTime || params.row.createdAt) : '-'
              },
              {
                field: 'logoutTime',
                headerName: 'Logout Time',
                width: 180,
                renderCell: (params) => params.value ? (
                  formatTime(params.value)
                ) : (
                  <div className="flex items-center gap-1 text-red-500 font-semibold text-sm h-full">
                    <WarningAmberIcon fontSize="small" /> Not Set
                  </div>
                )
              },
              {
                field: 'actions',
                headerName: 'Actions',
                width: 220,
                sortable: false,
                renderCell: (params) => (
                  <div className="flex items-center gap-2 h-full">
                    <Button
                      variant="contained"
                      size="small"
                      color="info"
                      startIcon={<RemoveRedEyeOutlinedIcon />}
                      onClick={() => {
                        setSelectedViewRecord(params.row);
                        setViewDialog(true);
                      }}
                      className="normal-case"
                    >
                      View
                    </Button>
                    {!params.row.logoutTime && (
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        startIcon={<LogoutOutlinedIcon />}
                        onClick={() => handleSetLogoutClick(params.row._id)}
                        className="normal-case"
                      >
                        Logout
                      </Button>
                    )}
                  </div>
                )
              }
            ]}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 }
              }
            }}
            disableRowSelectionOnClick
          />
        </div>
      </div>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Mark Attendance</DialogTitle>
        <DialogContent className="flex flex-col items-center gap-4 pt-4">
          {!imgSrc ? (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="rounded-md border shadow-sm w-full max-w-sm"
              />
              <Button variant="contained" onClick={capture} fullWidth className="max-w-sm mt-4">
                Capture Photo
              </Button>
            </>
          ) : (
            <>
              <img src={imgSrc} alt="captured" className="rounded-md border shadow-sm w-full max-w-sm" />
              <div className="flex gap-2 w-full max-w-sm mt-4">
                <Button variant="outlined" color="secondary" onClick={retake} fullWidth disabled={loading}>
                  Retake
                </Button>
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions className="justify-center pb-4">
          <Button onClick={handleCloseDialog} color="secondary" disabled={loading}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => submitAttendance('Present')}
            disabled={!imgSrc || loading}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={logoutDialog} onClose={() => setLogoutDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent className="pt-4">
          <Typography>Are you sure you want to logout now?</Typography>
        </DialogContent>
        <DialogActions className="pb-4 pr-4">
          <Button onClick={() => setLogoutDialog(false)} color="secondary">Cancel</Button>
          <Button onClick={handleSetLogout} color="success" variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>View Attendance</DialogTitle>
        <DialogContent className="pt-2">
          {selectedViewRecord && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg bg-gray-50 mt-2">
              {selectedViewRecord.photoUrl ? (
                <img src={selectedViewRecord.photoUrl} alt="Employee" className="w-16 h-16 rounded-full object-cover border" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">N/A</div>
              )}
              <div className="flex-1">
                <Typography variant="h6" className="font-semibold text-gray-800">{selectedViewRecord.employeeId?.userName || 'Unknown'}</Typography>
                <Typography variant="body2" color="textSecondary" className="mb-2">Emp ID: {selectedViewRecord.employeeId?.employeeId || 'N/A'}</Typography>
                <div className="flex flex-wrap gap-4">
                  <Typography variant="body2"><strong>Date:</strong> {new Date(selectedViewRecord.date).toLocaleDateString()}</Typography>
                  <Typography variant="body2"><strong>Login:</strong> {selectedViewRecord.loginTime || selectedViewRecord.createdAt ? formatTime(selectedViewRecord.loginTime || selectedViewRecord.createdAt) : '-'}</Typography>
                  <Typography variant="body2"><strong>Logout:</strong> {selectedViewRecord.logoutTime ? formatTime(selectedViewRecord.logoutTime) : 'Not Set'}</Typography>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default AttendanceView
