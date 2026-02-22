import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../Assets/logo.png';
import { SubscriptionsIcon, AnalyticsIcon } from './Icons';
import { useAdminAuth } from '../context/AdminAuthContext';

const TAB_CLASS =
  'flex items-center gap-2 font-inter font-semibold text-sm py-2 px-1 border-b-[3px] border-transparent transition-colors';
const TAB_ACTIVE = 'text-[#6E43B9] border-b-[#6E43B9]';
const TAB_INACTIVE = 'text-[#6C737F] hover:text-[#6E43B9]';

const TABS = [
  { to: '/dashboard', label: 'Subscriptions', Icon: SubscriptionsIcon, end: true },
  { to: '/dashboard/analytics', label: 'Analytics', Icon: AnalyticsIcon, end: false },
];

function DashNav() {
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  useEffect(() => {
    const fn = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('click', fn);
    return () => document.removeEventListener('click', fn);
  }, []);

  const renderTab = (tab, isDrawer = false) => {
    const { to, label, Icon, end } = tab;
    const linkClass = isDrawer ? 'block py-3 px-2 border-b border-transparent' : '';
    return (
      <NavLink
        key={to}
        to={to}
        end={end}
        onClick={isDrawer ? () => setDrawerOpen(false) : undefined}
        className={({ isActive }) => {
          const base = isDrawer ? `${TAB_CLASS} ${linkClass}` : TAB_CLASS;
          return `${base} ${isActive ? TAB_ACTIVE : TAB_INACTIVE}`;
        }}
      >
        {() => (
          <>
            <Icon className="w-5 h-5 shrink-0" />
            <span>{label}</span>
          </>
        )}
      </NavLink>
    );
  };

  return (
    <>
      <nav className="bg-white">
        <div className="max-w-[1440px] mx-auto">
          {/* Top section: logo (left), burger on mobile / profile on desktop (right) */}
          <div className="flex items-center justify-between py-4 px-4 sm:px-6 lg:px-20 border-b border-[#F2F4F7]">
            <NavLink to="/dashboard" className="flex items-center">
              <img src={logo} alt="Reviewly" className="h-9 w-auto object-contain" />
            </NavLink>
            {/* Burger - mobile only (replaces profile in top bar) */}
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
              className="md:hidden p-2 rounded-lg text-[#6C737F] hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Profile - desktop only (mobile: shown inside drawer) */}
            <div className="hidden md:block relative" ref={profileRef}>
              <button
                type="button"
                aria-label="Profile"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((o) => !o)}
                className="w-10 h-10 rounded-full border-2 border-[#6E43B9]/30 bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 hover:ring-2 hover:ring-[#6E43B9]/20 transition-shadow"
              >
                <span className="text-lg text-[#6E43B9]">👤</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 py-2 bg-white rounded-lg shadow-lg border border-[#E5E7EB] z-50">
                  <p className="px-4 py-2 font-inter text-sm text-[#6C737F] truncate" title={admin?.email}>
                    {admin?.email || '—'}
                  </p>
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); handleLogout(); }}
                    className="w-full px-4 py-2 font-inter font-medium text-sm text-red-600 hover:bg-red-50 text-left transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom tabs - desktop only */}
          <div className="hidden md:flex items-center gap-2 py-2 px-4 sm:px-6 lg:px-20">
            {TABS.map((tab) => renderTab(tab, false))}
          </div>
        </div>
      </nav>

      {/* Backdrop - mobile drawer overlay */}
      <div
        role="presentation"
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-out md:hidden ${
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Drawer - slides in from right */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] max-w-[85vw] z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out md:hidden ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-modal="true"
        aria-label="Dashboard navigation"
      >
        <div className="flex justify-between items-center h-14 px-6 border-b border-[#F2F4F7]">
          <span className="text-lg font-semibold text-[#0F172A]">Menu</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="p-2 rounded-lg text-[#6C737F] hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col p-4 gap-0 flex-1">
          {TABS.map((tab) => renderTab(tab, true))}
        </nav>
        <div className="p-4 mt-auto border-t border-[#F2F4F7]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#6E43B9]/30 bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
              <span className="text-lg text-[#6E43B9]">👤</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-inter text-sm font-semibold text-[#0F172A] truncate">
                {admin?.firstName} {admin?.lastName}
              </p>
              <p className="font-inter text-xs text-[#6C737F] truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { setDrawerOpen(false); handleLogout(); }}
            className="w-full font-inter font-medium text-sm text-red-600 hover:bg-red-50 py-2 border border-red-200 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default DashNav;
