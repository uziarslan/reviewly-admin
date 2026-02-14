import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import DashNav from '../components/DashNav';
import UsersTable from '../components/UsersTable';

export default function Dashboard() {
    const { admin, logout } = useAdminAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#F5F4FF]">
            <DashNav />

            {/* Main content */}
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-6">
                {/* Header with logout */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#333]">
                        Welcome, {admin?.firstName || 'Admin'}!
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:opacity-90 transition"
                    >
                        Logout
                    </button>
                </div>

                {/* Users table */}
                <UsersTable />
            </div>
        </div>
    );
}
