import React, { useState, useEffect, useCallback } from "react";
import { usersAPI } from "../services/api";
import {
  SearchIcon,
  FilterIcon,
  ArrowDownIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "./Icons";
import {
  EditSubscriptionModal,
  BlockUserModal,
  DeleteAccountModal,
} from "./Modals";

const PLAN_LABEL = {
  free: "Free",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
};

const statusBadge = (user) => {
  if (user.blocked)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Blocked
      </span>
    );

  const plan = user.subscription?.plan || "free";
  if (plan === "free")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        Free
      </span>
    );

  const expired =
    user.subscription?.expiresAt &&
    new Date(user.subscription.expiresAt) < new Date();

  if (expired)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
        Expired
      </span>
    );

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      Active
    </span>
  );
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const ROWS_PER_PAGE = 10;

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* Modal state */
  const [editUser, setEditUser] = useState(null);
  const [blockUser, setBlockUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const fetchUsers = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const data = await usersAPI.getAll(page, ROWS_PER_PAGE, search);
        setUsers(data.users);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  useEffect(() => {
    const debounce = setTimeout(() => fetchUsers(1), 300);
    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  /* ── Modal handlers ──────────────────────────── */

  const handleEditOpen = (user) => {
    setEditUser(user);
  };

  const handleEditSave = async (payload) => {
    if (!editUser) return;
    try {
      const planMap = {
        Free: "free",
        Weekly: "weekly",
        Monthly: "monthly",
        Quarterly: "quarterly",
      };
      await usersAPI.update(editUser._id, {
        subscription: {
          plan: planMap[payload.subscriptionType] || "free",
          startDate: payload.startDate
            ? new Date(payload.startDate).toISOString()
            : null,
          expiresAt: payload.endDate
            ? new Date(payload.endDate).toISOString()
            : null,
        },
      });
      fetchUsers(pagination.page);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleBlock = async () => {
    if (!blockUser) return;
    try {
      await usersAPI.update(blockUser._id, {
        blocked: !blockUser.blocked,
      });
      fetchUsers(pagination.page);
    } catch (err) {
      console.error("Block failed:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      await usersAPI.remove(deleteUser._id);
      fetchUsers(pagination.page);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  /* ── Render ──────────────────────────────────── */

  return (
    <>
      {/* Card wrapper */}
      <div className="bg-white rounded-[12px] shadow-[0_1px_3px_0_rgba(16,24,40,0.1),0_1px_2px_0_rgba(16,24,40,0.06)]">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-[#EAECF0]">
          <div>
            <h2 className="font-inter font-semibold text-[18px] text-[#101828]">
              Users
            </h2>
            <p className="font-inter text-sm text-[#667085]">
              Manage user accounts and subscriptions
            </p>
          </div>

          {/* Search + filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-[240px] h-10 pl-10 pr-3 rounded-lg border border-[#D0D5DD] bg-white font-inter text-sm text-[#101828] placeholder:text-[#667085] outline-none focus:border-[#6E43B9] focus:ring-2 focus:ring-[#6E43B9]/30 transition-colors"
              />
            </div>
            <button
              type="button"
              className="h-10 px-4 rounded-lg border border-[#D0D5DD] bg-white flex items-center gap-2 font-inter font-semibold text-sm text-[#344054] hover:bg-gray-50 transition-colors"
            >
              <FilterIcon className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB]">
                <th className="text-left px-6 py-3">
                  <div className="flex items-center gap-1 font-inter font-medium text-xs text-[#667085]">
                    Name
                    <ArrowDownIcon className="w-4 h-4" />
                  </div>
                </th>
                <th className="text-left px-6 py-3 font-inter font-medium text-xs text-[#667085]">
                  Status
                </th>
                <th className="text-left px-6 py-3 font-inter font-medium text-xs text-[#667085]">
                  Subscription
                </th>
                <th className="text-left px-6 py-3 font-inter font-medium text-xs text-[#667085]">
                  Expires
                </th>
                <th className="text-left px-6 py-3 font-inter font-medium text-xs text-[#667085]">
                  Joined
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex justify-center">
                      <div className="w-7 h-7 border-4 border-[#6E43B9] border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 font-inter text-sm text-[#667085]"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const initials = `${(u.firstName || "")[0] || ""}${
                    (u.lastName || "")[0] || ""
                  }`.toUpperCase();

                  return (
                    <tr
                      key={u._id}
                      className="border-t border-[#EAECF0] hover:bg-[#F9FAFB] transition-colors"
                    >
                      {/* Name + email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#ECE8F3] flex items-center justify-center shrink-0">
                            <span className="font-inter font-semibold text-sm text-[#431C86]">
                              {initials}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-inter font-medium text-sm text-[#101828] truncate">
                              {u.firstName} {u.lastName}
                            </p>
                            <p className="font-inter text-sm text-[#667085] truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Status badge */}
                      <td className="px-6 py-4">{statusBadge(u)}</td>
                      {/* Subscription plan */}
                      <td className="px-6 py-4 font-inter text-sm text-[#667085]">
                        {PLAN_LABEL[u.subscription?.plan] || "Free"}
                      </td>
                      {/* Expires */}
                      <td className="px-6 py-4 font-inter text-sm text-[#667085]">
                        {fmtDate(u.subscription?.expiresAt)}
                      </td>
                      {/* Joined */}
                      <td className="px-6 py-4 font-inter text-sm text-[#667085]">
                        {fmtDate(u.createdAt)}
                      </td>
                      {/* Edit button */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleEditOpen(u)}
                          className="p-2 rounded-lg text-[#667085] hover:bg-gray-100 transition-colors"
                          aria-label={`Edit ${u.firstName}`}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#EAECF0]">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => fetchUsers(pagination.page - 1)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#D0D5DD] bg-white font-inter font-semibold text-sm text-[#344054] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              Previous
            </button>
            <span className="font-inter text-sm text-[#344054]">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              type="button"
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchUsers(pagination.page + 1)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#D0D5DD] bg-white font-inter font-semibold text-sm text-[#344054] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────── */}
      <EditSubscriptionModal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        data={
          editUser
            ? {
                email: editUser.email,
                name: `${editUser.firstName} ${editUser.lastName}`,
                subscription:
                  PLAN_LABEL[editUser.subscription?.plan] || "Free",
                startDate: editUser.subscription?.startDate || "",
                endDate: editUser.subscription?.expiresAt || "",
              }
            : {}
        }
        onSave={handleEditSave}
        onBlockUser={() => {
          setBlockUser(editUser);
          setEditUser(null);
        }}
        onDeleteAccount={() => {
          setDeleteUser(editUser);
          setEditUser(null);
        }}
      />

      <BlockUserModal
        isOpen={!!blockUser}
        onClose={() => setBlockUser(null)}
        onConfirm={handleBlock}
      />

      <DeleteAccountModal
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        userEmail={deleteUser?.email || ""}
        onConfirm={handleDelete}
      />
    </>
  );
}
