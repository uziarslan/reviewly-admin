import React, { useState, useMemo } from 'react';
import DashNav from '../components/DashNav';
import { SearchIcon, FilterIcon, ArrowDownIcon, PencilIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';
import { EditSubscriptionModal, BlockUserModal, DeleteAccountModal } from '../components/Modals';

const SAMPLE_SUBSCRIPTIONS = [
    {
        id: 1,
        email: 'jahz@reviewly.ph',
        name: 'First Last',
        subscription: 'Quarterly',
        startDate: 'January 1, 2026',
        endDate: 'March 31, 2026',
        hasPremium: true,
        status: 'Active',
    },
    {
        id: 2,
        email: 'user@reviewly.ph',
        name: 'First Last',
        subscription: 'Weekly',
        startDate: null,
        endDate: null,
        hasPremium: false,
        status: 'Blocked',
    },
];

function StatusBadge({ value, type }) {
    const styles = {
        Active: 'text-[#039855] bg-[#ECFDF3]',
        Blocked: 'text-[#D92D20] bg-[#F7E0E0]',
        Yes: 'text-[#037847] bg-[#ECFDF3]',
        No: 'text-[#667085] bg-[#E0E2E7]',
    };
    const dotColors = {
        Active: 'bg-[#14BA6D]',
        Blocked: 'bg-[#CC2D30]',
        Yes: 'bg-[#14BA6D]',
        No: 'bg-[#667085]',
    };
    const c = styles[type] || styles.No;
    const dot = dotColors[type] || dotColors.No;
    return (
        <span className={`inline-flex items-center gap-[7px] text-sm py-[2px] px-[8px] rounded-[16px] ${c}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} aria-hidden />
            {value}
        </span>
    );
}

function TableHeader({ children, className = '' }) {
    return (
        <th
            scope="col"
            className={`text-left font-semibold text-sm text-[#344054] ${className}`}
        >
            <span className="inline-flex items-center gap-[4px] font-inter font-medium text-[12px] text-[#667085] py-[13px] pl-[24px] shrink-0 whitespace-nowrap">
                {children}
                <ArrowDownIcon className='w-[16px] h-[16px]' />
            </span>
        </th>
    );
}

const ROWS_PER_PAGE = 14;

export default function Dashboard() {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [subscriptions, setSubscriptions] = useState(SAMPLE_SUBSCRIPTIONS);
    const [selectedRow, setSelectedRow] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [blockUserModalOpen, setBlockUserModalOpen] = useState(false);
    const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);

    const filtered = useMemo(() => {
        if (!search.trim()) return subscriptions;
        const q = search.toLowerCase();
        return subscriptions.filter(
            (s) =>
                s.email.toLowerCase().includes(q) ||
                s.name.toLowerCase().includes(q) ||
                s.subscription.toLowerCase().includes(q) ||
                s.status.toLowerCase().includes(q)
        );
    }, [search, subscriptions]);

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ROWS_PER_PAGE));
    const page = Math.min(Math.max(1, currentPage), totalPages);
    const startIndex = (page - 1) * ROWS_PER_PAGE;
    const endIndex = Math.min(startIndex + ROWS_PER_PAGE, totalItems);

    const pageData = useMemo(() => filtered.slice(startIndex, startIndex + ROWS_PER_PAGE), [filtered, startIndex]);

    const rowsWithEmpty = useMemo(() => {
        const filled = [...pageData];
        while (filled.length < ROWS_PER_PAGE) filled.push(null);
        return filled.slice(0, ROWS_PER_PAGE);
    }, [pageData]);

    const showStart = totalItems === 0 ? 0 : startIndex + 1;
    const showEnd = endIndex;

    const openEditModal = (row) => {
        setSelectedRow(row);
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setSelectedRow(null);
    };

    const handleSaveEdit = (payload) => {
        if (!selectedRow) return;
        setSubscriptions((prev) =>
            prev.map((s) =>
                s.id === selectedRow.id
                    ? {
                        ...s,
                        subscription: payload.subscriptionType,
                        startDate: payload.startDate || null,
                        endDate: payload.endDate || null,
                    }
                    : s
            )
        );
    };

    const openBlockUserModal = () => {
        setEditModalOpen(false);
        setBlockUserModalOpen(true);
    };

    const handleBlockUser = () => {
        if (!selectedRow) return;
        setSubscriptions((prev) =>
            prev.map((s) => (s.id === selectedRow.id ? { ...s, status: 'Blocked' } : s))
        );
        setBlockUserModalOpen(false);
        setSelectedRow(null);
    };

    const openDeleteAccountModal = () => {
        setEditModalOpen(false);
        setDeleteAccountModalOpen(true);
    };

    const handleDeleteAccount = () => {
        if (!selectedRow) return;
        setSubscriptions((prev) => prev.filter((s) => s.id !== selectedRow.id));
        setDeleteAccountModalOpen(false);
        setSelectedRow(null);
    };

    return (
        <div className="min-h-screen bg-[#F5F4FF]">
            <DashNav />

            {/* Main content */}
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-6">
                <div className="bg-white rounded-[12px] overflow-hidden p-[24px]">
                    <div className="border border-[#EAECF0] rounded-[12px]">
                        {/* Search and filters */}
                        <div className="flex flex-col sm:flex-row gap-[12px] p-4 sm:p-6">
                            <div className="relative flex-1 max-w-[400px]">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C737F]" aria-hidden>
                                    <SearchIcon className='w-[20px] h-[20px]' />
                                </span>
                                <input
                                    type="search"
                                    placeholder="Search"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#D0D5DD] text-[16px] font-inter font-normal text-[#101828] placeholder:font-inter placeholder:font-normal placeholder:text-[16px] placeholder:text-[#667085] focus:outline-none focus:ring-2 focus:ring-[#6E43B9]/30 focus:border-[#6E43B9]"
                                    aria-label="Search subscriptions"
                                />
                            </div>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center gap-2 px-[16px] py-[10px] rounded-[8px] border border-[#D0D5DD] bg-white font-inter font-medium text-[14px] text-[#344054] hover:bg-[#F9FAFB] transition-colors"
                            >
                                <FilterIcon className='w-[20px] h-[20px]' />
                                Filters
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]" role="grid" aria-label="Subscriptions">
                                <thead className='bg-[#FCFCFD]'>
                                    <tr className="border-b border-[#EAECF0]">
                                        <TableHeader>Email</TableHeader>
                                        <TableHeader>Name</TableHeader>
                                        <TableHeader>Subscription</TableHeader>
                                        <TableHeader>Start Date</TableHeader>
                                        <TableHeader>End Date</TableHeader>
                                        <TableHeader>Has Premium?</TableHeader>
                                        <TableHeader>Status</TableHeader>
                                        <th scope="col" className="w-12 py-3 pr-6 text-right" aria-label="Actions" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {rowsWithEmpty.map((row, index) => (
                                        <tr
                                            key={row ? row.id : `empty-${index}`}
                                            className="border-b border-[#EAECF0] hover:bg-[#F9FAFB] transition-colors"
                                        >
                                            <td className="py-[12px] pl-[24px] font-inter font-normal text-[14px] text-[#667085] whitespace-nowrap">{row ? row.email : '\u00A0'}</td>
                                            <td className="py-[12px] pl-[24px] font-inter font-normal text-[14px] text-[#667085] whitespace-nowrap">{row ? row.name : '\u00A0'}</td>
                                            <td className="py-[12px] pl-[24px] font-inter font-normal text-[14px] text-[#667085] whitespace-nowrap">{row ? row.subscription : '\u00A0'}</td>
                                            <td className="py-[12px] pl-[24px] font-inter font-normal text-[14px] text-[#667085] whitespace-nowrap">{row ? (row.startDate ?? '–') : '\u00A0'}</td>
                                            <td className="py-[12px] pl-[24px] font-inter font-normal text-[14px] text-[#667085] whitespace-nowrap">{row ? (row.endDate ?? '–') : '\u00A0'}</td>
                                            <td className="py-[12px] pl-[24px] font-inter font-medium text-[12px] whitespace-nowrap">
                                                {row ? <StatusBadge value={row.hasPremium ? 'Yes' : 'No'} type={row.hasPremium ? 'Yes' : 'No'} /> : '\u00A0'}
                                            </td>
                                            <td className="py-[12px] pl-[24px] font-inter font-medium text-[12px] whitespace-nowrap">
                                                {row ? <StatusBadge value={row.status} type={row.status} /> : '\u00A0'}
                                            </td>
                                            <td className="py-[12px] pl-[24px] pr-6 text-right whitespace-nowrap">
                                                {row ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(row)}
                                                        className="p-2 rounded-lg text-[#6C737F] hover:bg-[#F2F4F7] hover:text-[#344054] transition-colors"
                                                        aria-label="Edit subscription"
                                                    >
                                                        <PencilIcon className='w-[12px] h-[12px]' />
                                                    </button>
                                                ) : '\u00A0'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Table footer / pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#EAECF0] bg-[#FCFCFD]">
                            <p className="font-inter text-[14px] text-[#667085] order-2 sm:order-1">
                                Showing {showStart}–{showEnd} of {totalItems}
                            </p>
                            <div className="flex items-center gap-2 order-1 sm:order-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB] disabled:opacity-50 disabled:pointer-events-none transition-colors"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeftIcon className="w-5 h-5" />
                                </button>
                                <span className="font-inter font-medium text-[14px] text-[#344054] min-w-[80px] text-center">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    disabled={page >= totalPages}
                                    className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB] disabled:opacity-50 disabled:pointer-events-none transition-colors"
                                    aria-label="Next page"
                                >
                                    <ChevronRightIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <EditSubscriptionModal
                isOpen={editModalOpen}
                onClose={closeEditModal}
                data={
                    selectedRow
                        ? {
                            email: selectedRow.email,
                            name: selectedRow.name,
                            subscription: selectedRow.subscription,
                            startDate: selectedRow.startDate ?? '',
                            endDate: selectedRow.endDate ?? '',
                        }
                        : {}
                }
                onSave={handleSaveEdit}
                onBlockUser={openBlockUserModal}
                onDeleteAccount={openDeleteAccountModal}
            />
            <BlockUserModal
                isOpen={blockUserModalOpen}
                onClose={() => {
                    setBlockUserModalOpen(false);
                    setSelectedRow(null);
                }}
                onConfirm={handleBlockUser}
            />
            <DeleteAccountModal
                isOpen={deleteAccountModalOpen}
                onClose={() => {
                    setDeleteAccountModalOpen(false);
                    setSelectedRow(null);
                }}
                userEmail={selectedRow?.email ?? ''}
                onConfirm={handleDeleteAccount}
            />
        </div>
    );
}
