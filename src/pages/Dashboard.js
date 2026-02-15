import React from 'react';
import DashNav from '../components/DashNav';
import UsersTable from '../components/UsersTable';

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-[#F5F4FF]">
            <DashNav />

            {/* Main content */}
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-6">
                {/* Users table */}
                <UsersTable />
            </div>
        </div>
    );
}
