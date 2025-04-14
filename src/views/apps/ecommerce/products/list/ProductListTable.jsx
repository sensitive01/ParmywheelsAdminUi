'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

import Link from 'next/link'

import { useParams , useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

// Next Imports
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
import Tooltip from '@mui/material/Tooltip'

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
import AddIcon from '@mui/icons-material/Add';


// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

const API_URL = process.env.NEXT_PUBLIC_API_URL


// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Status color mapping for vendor status
export const statusChipColor = {
  approved: { color: 'success' },
  pending: { color: 'warning' },
  rejected: { color: 'error' },
  suspended: { color: '#666CFF' }
};

// Place type icon mapping
export const placeTypeIcons = {
  mall: { icon: 'ri-store-3-line', color: '#ff4d49' },
  apartment: { icon: 'ri-building-line', color: '#72e128' },
  commercial: { icon: 'ri-building-4-line', color: '#fdb528' },
  hospital: { icon: 'ri-hospital-line', color: '#00cfe8' },
  default: { icon: 'ri-map-pin-line', color: '#282a42' }
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

     // Add a newline before the return statement
return () => clearTimeout(timeout)
  }, [value, debounce, onChange])
  
    // Add a blank line before the return statement

  return (
    <TextField
      {...props}
      value={value}
      onChange={e => setValue(e.target.value)}
      size="small"
    />
  );
};

const columnHelper = createColumnHelper()

const VendorListTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const { lang: locale } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  const [vendorLoading, setVendorLoading] = useState({});
const [vendorStatusMap, setVendorStatusMap] = useState({});


  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/vendor/all-vendors`)
      const result = await response.json()

      if (result && result.data) {
        setData(result.data)
        setFilteredData(result.data)
      } else {
        setData([])
        setFilteredData([])
      }
    } catch (error) {
      console.error("Error fetching vendor data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [])

  // Function to update vendor status

//   const updateVendorStatus = async (vendorId, newStatus) => {
//     try {
//       const endpoint = newStatus === 'approved' 
//         ? `${API_URL}/vendor/approve/${vendorId}` 
//         : `${API_URL}/vendor/updateStatus/${vendorId}`;
      
//       const response = await fetch(endpoint, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ status: newStatus })
//       });

//       if (!response.ok) {
//         throw new Error('Failed to update vendor status');
//       }

//       // Update the data state with the new status
//       setData(prevData => 
//         prevData.map(vendor => 
//           vendor._id === vendorId ? { ...vendor, status: newStatus } : vendor
//         )
//       );
      
//       setFilteredData(prevData => 
//         prevData.map(vendor => 
//           vendor._id === vendorId ? { ...vendor, status: newStatus } : vendor
//         )
//       );

//       return true;
//     } catch (error) {
//       console.error('Error updating vendor status:', error);
      
// return false;
//     }
//   };

// Function to update vendor status
const updateVendorStatus = async (vendorId, newStatus) => {
  setVendorLoading(prev => ({ ...prev, [vendorId]: true }));

  try {
    const endpoint = newStatus === 'approved' 
      ? `${API_URL}/vendor/approve/${vendorId}` 
      : `${API_URL}/vendor/updateStatus/${vendorId}`;

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (!response.ok) throw new Error('Failed to update vendor status');

    setVendorStatusMap(prev => ({ ...prev, [vendorId]: newStatus }));

    return true;
  } catch (error) {
    console.error('Error updating vendor status:', error);

    return false;
  } finally {
      // Add a blank line before the comment
    setVendorLoading(prev => ({ ...prev, [vendorId]: false }));
  }
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
      columnHelper.accessor('vendorId', {
        header: 'Vendor ID',
        cell: ({ row }) => <Typography style={{ color: '#666cff' }}>#{row.original.vendorId}</Typography>
      }),
      columnHelper.accessor('vendorName', {
        header: 'Vendor Name',
        cell: ({ row }) => {
          const vendor = row.original;
          const imgSrc = vendor.image || "https://demos.pixinvent.com/materialize-nextjs-admin-template/demo-1/images/avatars/1.png";
          
          return (
            <div className="flex items-center gap-3">
              {vendor.image ? (
                <img
                  src={imgSrc}
                  alt="Vendor Avatar"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <CustomAvatar skin='light' size={34}>
                  {getInitials(vendor.vendorName)}
                </CustomAvatar>
              )}
              <div className="flex flex-col">
                <Typography className="font-medium">{vendor.vendorName}</Typography>
                <Typography variant="body2">{vendor.spaceid}</Typography>
              </div>
            </div>
          );
        }
      }),
      columnHelper.accessor('contacts', {
        header: 'Contact Info',
        cell: ({ row }) => {
          const contacts = row.original.contacts || [];
          const primaryContact = contacts[0] || { name: 'N/A', mobile: 'N/A' };
          
          return (
            <div className="flex flex-col">
              <Typography className="font-medium">{primaryContact.name}</Typography>
              <Typography variant="body2">{primaryContact.mobile}</Typography>
              {contacts.length > 1 && (
                <Typography variant="caption" color="text.secondary">
                  +{contacts.length - 1} more contacts
                </Typography>
              )}
            </div>
          );
        }
      }),
      columnHelper.accessor('address', {
        header: 'Address',
        cell: ({ row }) => {
          const placeType = row.original.address?.toLowerCase() || 'default';
          const { icon, color } = placeTypeIcons[placeType] || placeTypeIcons.default;
          
          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className={icon} style={{ fontSize: '16px', color }}></i>
              {row.original.address || 'Unknown'}
            </Typography>
          );
        }
      }),
 
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const vendorId = row.original._id;
          const isLoading = vendorLoading[vendorId] || false;
          const currentStatus = vendorStatusMap[vendorId] || row.original.status || 'pending';
      
          const toggleStatus = async () => {
            if (isLoading || currentStatus !== 'pending') return;
      
            const success = await updateVendorStatus(vendorId, 'approved');
      
            if (!success) {
              // Optional: rollback or show toast
            }
          };
      
          const chipStyles = {
            backgroundColor: currentStatus === 'pending' ? '#ff4d4f' : '#52c41a',
            color: 'white',
            cursor: currentStatus === 'pending' ? 'pointer' : 'default',
            opacity: isLoading ? 0.7 : 1,
            '&:hover': currentStatus === 'pending' ? { 
              backgroundColor: '#ff7875', 
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)' 
            } : {}
          };
      
          const chip = (
            <Chip
              label={isLoading ? '...' : (currentStatus || 'Pending')}
              variant="tonal"
              size="small"
              sx={chipStyles}
              onClick={currentStatus === 'pending' ? toggleStatus : undefined}
            />
          );
      
          return currentStatus === 'pending' ? (
            <Tooltip title="Click to approve">{chip}</Tooltip>
          ) : chip;
        }
      }),
      
      columnHelper.accessor('subscription', {
        header: 'Subscription',
        cell: ({ row }) => {
          const isSubscribed = row.original.subscription === "true";
          const daysLeft = row.original.subscriptionleft || "0";

          const endDate = row.original.subscriptionenddate 
            ? new Date(row.original.subscriptionenddate).toLocaleDateString() 
            : 'N/A';
          
          return (
            <div className="flex flex-col">
              <Chip
                label={isSubscribed ? "Active" : "Inactive"}
                variant="tonal"
                size="small"
                color={isSubscribed ? "success" : "default"}
              />
              {isSubscribed && (
                <Typography variant="caption">
                  {daysLeft} days left • Ends: {endDate}
                </Typography>
              )}
            </div>
          );
        }
      }),
      columnHelper.accessor('parkingEntries', {
        header: 'Parking Capacity',
        cell: ({ row }) => {
          const parkingEntries = row.original.parkingEntries || [];
          
          if (parkingEntries.length === 0) {
            return <Typography variant="body2">No entries</Typography>;
          }
          
          return (
            <div className="flex flex-col gap-1">
              {parkingEntries.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <i className={entry.type?.toLowerCase() === 'bike' ? 'ri-motorbike-fill' : 'ri-car-fill'} 
                     style={{ fontSize: '14px', color: entry.type?.toLowerCase() === 'bike' ? '#72e128' : '#ff4d49' }}></i>
                  <Typography variant="body2">
                    {entry.type}: <strong>{entry.count}</strong>
                  </Typography>
                </div>
              ))}
            </div>
          );
        }
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
      <CardHeader title='Vendor Management' />
      <Divider />
      <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Search Vendors'
          className='sm:is-auto'
        />
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
                  {loading ? 'Loading vendor data...' : 'No vendors found'}
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

export default VendorListTable
