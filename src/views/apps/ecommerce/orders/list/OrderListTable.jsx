'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

// Icons
import { Download, PictureAsPdf, GridOn } from '@mui/icons-material'
import { AccountBalanceWallet, Receipt, Summarize, CalendarToday } from '@mui/icons-material'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import TableFilters from '../../products/list/TableFilters'
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Style Imports
import tableStyles from '@core/styles/table.module.css'

export const stsChipColor = {
  instant: { color: '#ff4d49', text: 'Instant' },
  subscription: { color: '#72e128', text: 'Subscription' },
  schedule: { color: '#fdb528', text: 'Schedule' }
};

export const statusChipColor = {
  completed: { color: 'success' },
  pending: { color: 'warning' },
  parked: { color: '#666CFF' },
  cancelled: { color: 'error' },
  approved: { color: 'info' }
};

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({
    itemRank
  })

  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const PayableTimeTimer = ({ parkedDate, parkedTime }) => {
  const [elapsedTime, setElapsedTime] = useState('00:00:00')

  useEffect(() => {
    if (!parkedDate || !parkedTime) {
      setElapsedTime('00:00:00')
      return
    }
    const [day, month, year] = parkedDate.split('-')
    const [timePart, ampm] = parkedTime.split(' ')
    let [hours, minutes] = timePart.split(':')
    if (ampm && ampm.toUpperCase() === 'PM' && hours !== '12') {
      hours = parseInt(hours) + 12
    } else if (ampm && ampm.toUpperCase() === 'AM' && hours === '12') {
      hours = '00'
    }
    const parkingStartTime = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`)
    const timer = setInterval(() => {
      const now = new Date()
      const diffMs = now - parkingStartTime
      if (diffMs < 0) {
        setElapsedTime('00:00:00')
        return
      }

      const diffSecs = Math.floor(diffMs / 1000)
      const hours = Math.floor(diffSecs / 3600)
      const minutes = Math.floor((diffSecs % 3600) / 60)
      const seconds = diffSecs % 60

      const formattedHours = hours.toString().padStart(2, '0')
      const formattedMinutes = minutes.toString().padStart(2, '0')
      const formattedSeconds = seconds.toString().padStart(2, '0')

      setElapsedTime(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`)
    }, 1000)

    return () => clearInterval(timer)
  }, [parkedDate, parkedTime])

  return (
    <Typography sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
      {elapsedTime}
    </Typography>
  )
}

const columnHelper = createColumnHelper()

const OrderListTable = ({ orderData }) => {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [filteredData, setFilteredData] = useState(data)
  const { lang: locale } = useParams()
  const { data: session } = useSession()
  const router = useRouter();
  const vendorId = session?.user?.id
  
  // Download menu state
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/vendor/bookings`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Fetched bookings:', result);

        if (result && Array.isArray(result)) {
          setData(result);
          setFilteredData(result);
        } else if (result && result.bookings && Array.isArray(result.bookings)) {
          setData(result.bookings);
          setFilteredData(result.bookings);
        } else {
          console.warn('Unexpected response format:', result);
          setData([]);
          setFilteredData([]);
        }
      } catch (error) {
        console.error('Error fetching booking data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Download menu handlers
  const handleDownloadClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDownloadClose = () => {
    setAnchorEl(null);
  };

  const exportToExcel = () => {
    if (!data || data.length === 0) return;
    
    // Get the visible columns from the table
    const visibleColumns = [
      'vehicleNumber',
      'bookingDate',
      'personName',
      'sts',
      'status',
      'vehicleType'
    ];
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    const headers = [
      'Vehicle Number',
      'Booking Date & Time',
      'Customer Name',
      'Booking Type',
      'Status',
      'Vehicle Type'
    ];
    csvContent += headers.join(",") + "\r\n";
    
    // Add data rows
    data.forEach(row => {
      const rowData = [
        `"${row.vehicleNumber}"`,
        `"${row.bookingDate}, ${row.bookingTime}"`,
        `"${row.personName}"`,
        `"${stsChipColor[row.sts?.toLowerCase()]?.text || row.sts}"`,
        `"${row.status}"`,
        `"${row.vehicleType}"`
      ];
      csvContent += rowData.join(",") + "\r\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bookings_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    handleDownloadClose();
  };

  const exportToPDF = () => {
    if (!data || data.length === 0) return;
    
    // Create a basic PDF using browser's print functionality
    const printContent = `
      <html>
        <head>
          <title>Bookings Report</title>
          <style>
            body { font-family: Arial; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .summary { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Bookings Report</h1>
            <div>
              <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Total Bookings:</strong> ${data.length}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Vehicle No.</th>
                <th>Booking Date & Time</th>
                <th>Customer</th>
                <th>Booking Type</th>
                <th>Status</th>
                <th>Vehicle Type</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(booking => `
                <tr>
                  <td>${booking.vehicleNumber}</td>
                  <td>${booking.bookingDate}, ${booking.bookingTime}</td>
                  <td>${booking.personName}</td>
                  <td>${stsChipColor[booking.sts?.toLowerCase()]?.text || booking.sts}</td>
                  <td>${booking.status}</td>
                  <td>${booking.vehicleType}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const win = window.open('', '_blank');
    win.document.write(printContent);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
    
    handleDownloadClose();
  };

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        )
      },
      columnHelper.accessor('vehicleNumber', {
        header: 'Vehicle Number',
        cell: ({ row }) => <Typography style={{ color: '#666cff' }}>#{row.original.vehicleNumber}</Typography>
      }),
      columnHelper.accessor('bookingDate', {
        header: 'Booking Date & Time',
        cell: ({ row }) => {
          const formatDate = (dateStr) => {
            if (!dateStr) return 'Invalid Date';
            const [day, month, year] = dateStr.split('-');
            const formattedDate = new Date(`${year}-${month}-${day}`).toDateString();

            return formattedDate;
          };

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-calendar-2-line text-[26px]" style={{ fontSize: '16px', color: '#666' }}></i>
              {`${formatDate(row.original.bookingDate)}, ${row.original.bookingTime}`}
            </Typography>
          );
        }
      }),
      columnHelper.accessor('payableTime', {
        header: 'Payable Time',
        cell: ({ row }) => {
          const status = row.original.status?.toLowerCase();
          if (status === 'completed') {
            return null;
          }

          const isParked = status === 'parked';
          if (isParked) {
            return (
              <div className="flex items-center gap-2">
                <i className="ri-time-line" style={{ fontSize: '16px', color: '#666CFF' }}></i>
                <PayableTimeTimer
                  parkedDate={row.original.parkedDate}
                  parkedTime={row.original.parkedTime}
                />
              </div>
            );
          }

          return null;
        }
      }),
      columnHelper.accessor('customerName', {
        header: 'Customer',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <img
              src="https://demos.pixinvent.com/materialize-nextjs-admin-template/demo-1/images/avatars/1.png"
              alt="Customer Avatar"
              className="w-8 h-8 rounded-full"
            />
            <div className="flex flex-col">
              <Typography className="font-medium">{row.original.personName}</Typography>
              <Typography variant="body2">{row.original.mobileNumber}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('sts', {
        header: 'Booking Type',
        cell: ({ row }) => {
          const stsKey = row.original.sts?.toLowerCase();
          const chipData = stsChipColor[stsKey] || { color: 'text.secondary', text: row.original.sts };

          return (
            <Typography
              sx={{ color: chipData.color, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <i className="ri-circle-fill" style={{ fontSize: '10px', color: chipData.color }}></i>
              {chipData.text}
            </Typography>
          );
        }
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const statusKey = row.original.status?.toLowerCase();
          const chipData = statusChipColor[statusKey] || { color: 'default' };

          return (
            <Chip
              label={row.original.status}
              variant="tonal"
              size="small"
              sx={chipData.color.startsWith('#') ? { backgroundColor: chipData.color, color: 'white' } : {}}
              color={!chipData.color.startsWith('#') ? chipData.color : undefined}
            />
          );
        }
      }),
      columnHelper.accessor('vehicleType', {
        header: 'Vehicle Type',
        cell: ({ row }) => {
          const vehicleType = row.original.vehicleType?.toLowerCase();

          const vehicleIcons = {
            car: { icon: 'ri-car-fill', color: '#ff4d49' },
            bike: { icon: 'ri-motorbike-fill', color: '#72e128' },
            default: { icon: 'ri-roadster-fill', color: '#282a42' }
          };

          const { icon, color } = vehicleIcons[vehicleType] || vehicleIcons.default;

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className={icon} style={{ fontSize: '16px', color }}></i>
              {row.original.vehicleType}
            </Typography>
          );
        }
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-[22px]'
              options={[
                {
                  text: 'View',
                  icon: 'ri-eye-line',
                  menuItemProps: {
                    onClick: () => {
                      const selectedId = row.original._id;

                      if (selectedId) {
                        console.log('Navigating to Order Details:', selectedId);
                        router.push(`/pages/bookingdetails/${selectedId}`);
                      } else {
                        console.error('⚠️ Booking ID is undefined!');
                      }
                    }
                  }
                },
                {
                  text: 'Delete',
                  icon: 'ri-delete-bin-7-line text-[22px]',
                  menuItemProps: {
                    onClick: async () => {
                      try {
                        const selectedId = row.original._id;

                        if (!selectedId) {
                          console.error('⚠️ Booking ID is missing!');
                          return;
                        }

                        console.log('Attempting to delete Booking ID:', selectedId);
                        const isConfirmed = window.confirm("Are you sure you want to delete this booking?");

                        if (!isConfirmed) {
                          console.log('Deletion cancelled');
                          return;
                        }

                        const response = await fetch(`${API_URL}/vendor/deletebooking/${selectedId}`, {
                          method: 'DELETE'
                        });

                        if (!response.ok) {
                          throw new Error('Failed to delete booking');
                        }

                        console.log('✅ Booking Deleted:', selectedId);
                        setData(prevData => prevData.filter(booking => booking._id !== selectedId));
                      } catch (error) {
                        console.error('Error deleting booking:', error);
                      }
                    },
                    className: 'flex items-center gap-2 pli-4'
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    [data, filteredData]
  );

  const table = useReactTable({
    data: filteredData.length > 0 || globalFilter ? filteredData : data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  });

  return (
    <Card>
      <CardHeader title='Filters' />
      <TableFilters setData={setFilteredData} bookingData={data} />
      <Divider />
      <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Search Order'
          className='sm:is-auto'
        />
        
        <div className="flex gap-2">
          <Button
            variant='outlined'
            startIcon={<Download />}
            onClick={handleDownloadClick}
          >
            Export
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleDownloadClose}
          >
            <MenuItem onClick={exportToExcel}>
              <ListItemIcon>
                <GridOn fontSize="small" />
              </ListItemIcon>
              <ListItemText>Export to Excel</ListItemText>
            </MenuItem>
            <MenuItem onClick={exportToPDF}>
              <ListItemIcon>
                <PictureAsPdf fontSize="small" />
              </ListItemIcon>
              <ListItemText>Export to PDF</ListItemText>
            </MenuItem>
          </Menu>

          <Button
            variant='contained'
            component={Link}
            href={getLocalizedUrl('/pages/wizard-examples/property-listing', locale)}
            startIcon={<i className='ri-add-line' />}
            className='max-sm:is-full is-auto'
          >
            New Booking
          </Button>
        </div>
      </CardContent>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='ri-arrow-up-s-line text-xl' />,
                            desc: <i className='ri-arrow-down-s-line text-xl' />
                          }[header.column.getIsSorted()] ?? null}
                        </div>
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {table.getFilteredRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  No data available
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })}
            </tbody>
          )}
        </table>
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component='div'
        className='border-bs'
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        SelectProps={{
          inputProps: { 'aria-label': 'rows per page' }
        }}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
      />
    </Card>
  )
}

export default OrderListTable
