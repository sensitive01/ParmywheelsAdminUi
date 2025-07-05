'use client'

// React Imports
import React from 'react';
import { Fragment } from 'react';
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility'
import CloseIcon from '@mui/icons-material/Close'
import { DataGrid } from "@mui/x-data-grid";

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
import axios from 'axios'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

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
    }, [value, debounce, onChange])

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

// Vendor Settlement Modal Component
const VendorSettlementModal = ({ open, handleClose, vendorId }) => {
    const [settlementData, setSettlementData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSettlementData = async () => {
            if (!vendorId || !open) return;

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`${API_URL}/vendor/fetchvendorbookingrelease/${vendorId}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    // Filter out invalid entries and those with all zero amounts
                    const filteredData = data.data.filter(item => 
                        item && (
                            parseFloat(item.amount || 0) > 0 ||
                            parseFloat(item.totalamout || 0) > 0 ||
                            parseFloat(item.gstamout || 0) > 0 ||
                            parseFloat(item.releasefee || 0) > 0 ||
                            parseFloat(item.recievableamount || 0) > 0
                        )
                    );
                    setSettlementData(filteredData);
                } else {
                    setSettlementData([]);
                }
            } catch (err) {
                console.error("Failed to fetch settlement details:", err);
                setError(err.message || "Failed to fetch settlement details");
            } finally {
                setLoading(false);
            }
        };

        fetchSettlementData();
    }, [vendorId, open]);

    const formatCurrency = (value) => {
        if (value === null || value === undefined || isNaN(value)) return '₹0.00';
        return `₹${parseFloat(value).toFixed(2)}`;
    };

    const columns = [
         {
        field: 'serialNo',
        headerName: 'S.No',
        width: 80,
        renderCell: (params) => (
            <Typography>{params.api.getRowIndexRelativeToVisibleRows(params.id) + 1}</Typography>
        )
    },
        {
            field: '_id',
            headerName: 'Booking ID',
            width: 220,
            renderCell: (params) => (
                <Typography style={{ color: '#666cff' }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'amount',
            headerName: 'Amount',
            width: 120,
            renderCell: (params) => formatCurrency(params.value)
        },
        {
            field: 'gstamout',
            headerName: 'GST',
            width: 120,
            renderCell: (params) => formatCurrency(params.value)
        },
        {
            field: 'totalamout',
            headerName: 'Total Amount',
            width: 150,
            renderCell: (params) => formatCurrency(params.value)
        },
        {
            field: 'releasefee',
            headerName: 'Release Fee',
            width: 150,
            renderCell: (params) => formatCurrency(params.value)
        },
        {
            field: 'recievableamount',
            headerName: 'Receivable',
            width: 150,
            renderCell: (params) => (
                <Typography fontWeight="bold" color="#329a73">
                    {formatCurrency(params.value)}
                </Typography>
            )
        },
          {
            field: 'settlementStatus',
            headerName: 'Settlement Status',
            width: 180,
            renderCell: (params) => (
                <Chip
                    label="Pending"
                    color="warning"
                    variant="outlined"
                    size="small"
                />
            )
        }
    ];

    const calculateTotals = () => {
        return settlementData.reduce((acc, item) => {
            if (!item) return acc;
            
            acc.amount += parseFloat(item.amount || 0);
            acc.gstamout += parseFloat(item.gstamout || 0);
            acc.totalamout += parseFloat(item.totalamout || 0);
            acc.releasefee += parseFloat(item.releasefee || 0);
            acc.recievableamount += parseFloat(item.recievableamount || 0);

            return acc;
        }, {
            amount: 0,
            gstamout: 0,
            totalamout: 0,
            releasefee: 0,
            recievableamount: 0
        });
    };

    const totals = calculateTotals();

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Vendor Settlement Details
                    <IconButton aria-label="close" onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : settlementData.length === 0 ? (
                    <Alert severity="info">No settlement data available for this vendor</Alert>
                ) : (
                    <>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Booking Transactions
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Records: {settlementData.length}
                            </Typography>
                        </Box>

                        <Box sx={{ height: 500, width: '100%' }}>
                            <DataGrid
                                rows={settlementData}
                                columns={columns}
                                getRowId={(row) => row._id || Math.random().toString(36).substring(2, 9)}
                                pageSizeOptions={[5, 10, 25]}
                                initialState={{
                                    pagination: {
                                        paginationModel: { pageSize: 10 },
                                    },
                                }}
                                sx={{
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: '#329a73',
                                        color: 'black',
                                    },
                                }}
                            />
                        </Box>

                        <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                Summary Totals
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                                    <Typography variant="h6">{formatCurrency(totals.amount)}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Total GST</Typography>
                                    <Typography variant="h6">{formatCurrency(totals.gstamout)}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Total Payable</Typography>
                                    <Typography variant="h6">{formatCurrency(totals.totalamout)}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Total Release Fee</Typography>
                                    <Typography variant="h6">{formatCurrency(totals.releasefee)}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Total Receivable</Typography>
                                    <Typography variant="h6" color="#329a73" fontWeight="bold">
                                        {formatCurrency(totals.recievableamount)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">Close</Button>
            </DialogActions>
        </Dialog>
    );
};
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

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedVendorId, setSelectedVendorId] = useState(null);

    const handleOpenModal = (vendorId) => {
        setSelectedVendorId(vendorId);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

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
            setVendorLoading(prev => ({ ...prev, [vendorId]: false }));
        }
    };

    const columns = useMemo(
        () => [
            {
                id: 'serialNo',
                header: 'S.No',
                cell: ({ row }) => (
                    <Typography>{row.index + 1}</Typography>
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
                        color: 'black',
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
            columnHelper.accessor('actions', {
                header: 'Actions',
                cell: ({ row }) => {
                    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
                    const [deleteLoading, setDeleteLoading] = useState(false);

                    const handleDeleteVendor = async () => {
                        try {
                            setDeleteLoading(true);
                            const response = await fetch(`${API_URL}/admin/deletevendor/${row.original.vendorId}`, {
                                method: 'DELETE',
                            });

                            if (!response.ok) {
                                throw new Error('Failed to delete vendor');
                            }

                            setDeleteDialogOpen(false);
                            fetchVendors();

                        } catch (error) {
                            console.error('Error deleting vendor:', error);
                        } finally {
                            setDeleteLoading(false);
                        }
                    };

                    return (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                size="small"
                                color="primary"
                                startIcon={<VisibilityIcon />}
                                onClick={() => handleOpenModal(row.original._id)}
                            >
                                View
                            </Button>

                            <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                Delete
                            </Button>

                            <Dialog
                                open={deleteDialogOpen}
                                onClose={() => setDeleteDialogOpen(false)}
                            >
                                <DialogTitle>Confirm Deletion</DialogTitle>
                                <DialogContent>
                                    <Typography>
                                        Are you sure you want to delete vendor <strong>{row.original.vendorName}</strong> (ID: {row.original.vendorId})?
                                        This action cannot be undone.
                                    </Typography>
                                </DialogContent>
                                <DialogActions>
                                    <Button
                                        onClick={() => setDeleteDialogOpen(false)}
                                        color="primary"
                                        disabled={deleteLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleDeleteVendor}
                                        color="error"
                                        variant="contained"
                                        disabled={deleteLoading}
                                        startIcon={deleteLoading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                                    >
                                        {deleteLoading ? 'Deleting...' : 'Delete'}
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </Box>
                    );
                }
            })
        ],
        [data, filteredData, vendorLoading, vendorStatusMap]
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
            <CardHeader title='Vendor Settlement' />
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

            {/* Vendor Settlement Modal */}
            <VendorSettlementModal
                open={modalOpen}
                handleClose={handleCloseModal}
                vendorId={selectedVendorId}
            />
        </Card>
    )
}

export default VendorListTable
