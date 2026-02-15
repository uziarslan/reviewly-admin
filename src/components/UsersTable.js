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

/** Yes/No tag: paddingX 8px, paddingY 2px, radius 16px, gap 6px */
const TagYes = () => (
  <span
    className="inline-flex items-center gap-[6px] px-2 py-0.5 rounded-[16px] font-inter font-medium text-[12px]"
    style={{ backgroundColor: "#ECFDF3", color: "#037847" }}
  >
    <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ backgroundColor: "#14BA6D" }} />
    Yes
  </span>
);

const TagNo = () => (
  <span
    className="inline-flex items-center gap-[6px] px-2 py-0.5 rounded-[16px] font-inter font-medium text-[12px]"
    style={{ backgroundColor: "#E0E2E7", color: "#667085" }}
  >
    <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ backgroundColor: "#667085" }} />
    No
  </span>
);

const TagActive = () => (
  <span
    className="inline-flex items-center gap-[6px] px-2 py-0.5 rounded-[16px] font-inter font-medium text-[12px]"
    style={{ backgroundColor: "#ECFDF3", color: "#037847" }}
  >
    <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ backgroundColor: "#14BA6D" }} />
    Active
  </span>
);

const TagBlocked = () => (
  <span
    className="inline-flex items-center gap-[6px] px-2 py-0.5 rounded-[16px] font-inter font-medium text-[12px]"
    style={{ backgroundColor: "#FEE2E2", color: "#CC2D30" }}
  >
    <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ backgroundColor: "#CC2D30" }} />
    Blocked
  </span>
);

const hasPremium = (user) => {
  const plan = user.subscription?.plan || "free";
  if (plan === "free") return false;
  const expiresAt = user.subscription?.expiresAt;
  if (expiresAt && new Date(expiresAt) < new Date()) return false;
  return true;
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "—";

const ROWS_PER_PAGE = 16;
const ROW_HEIGHT = 56;

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
    const planMap = {
      Free: "free",
      Weekly: "weekly",
      Monthly: "monthly",
      Quarterly: "quarterly",
    };
    const newSubscription = {
      plan: planMap[payload.subscriptionType] || "free",
      startDate: payload.startDate ? new Date(payload.startDate).toISOString() : null,
      expiresAt: payload.endDate ? new Date(payload.endDate).toISOString() : null,
    };
    const prevUser = { ...editUser };
    setUsers((prev) =>
      prev.map((u) =>
        u._id === editUser._id
          ? { ...u, subscription: { ...u.subscription, ...newSubscription } }
          : u
      )
    );
    setEditUser(null);
    try {
      await usersAPI.update(editUser._id, { subscription: newSubscription });
    } catch (err) {
      console.error("Update failed:", err);
      setUsers((prev) =>
        prev.map((u) => (u._id === prevUser._id ? prevUser : u))
      );
    }
  };

  const handleBlock = async () => {
    if (!blockUser) return;
    const newBlocked = !blockUser.blocked;
    const prevUser = { ...blockUser };
    setUsers((prev) =>
      prev.map((u) =>
        u._id === blockUser._id ? { ...u, blocked: newBlocked } : u
      )
    );
    setBlockUser(null);
    try {
      await usersAPI.update(blockUser._id, { blocked: newBlocked });
    } catch (err) {
      console.error("Block failed:", err);
      setUsers((prev) =>
        prev.map((u) => (u._id === prevUser._id ? prevUser : u))
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    const prevUser = { ...deleteUser };
    setUsers((prev) => prev.filter((u) => u._id !== deleteUser._id));
    setDeleteUser(null);
    try {
      await usersAPI.remove(deleteUser._id);
    } catch (err) {
      console.error("Delete failed:", err);
      setUsers((prev) => [...prev, prevUser]);
    }
  };

  /* ── Render ──────────────────────────────────── */

  return (
    <>
      {/* Card wrapper */}
      <div className="bg-white rounded-[12px] shadow-[0_1px_3px_0_rgba(16,24,40,0.1),0_1px_2px_0_rgba(16,24,40,0.06)]">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-3 p-5 border-b border-[#EAECF0]">
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
                  <div className="flex items-center gap-1 font-inter font-medium text-xs text-[#667085] whitespace-nowrap">
                    Email
                    <ArrowDownIcon className="w-4 h-4 shrink-0" />
                  </div>
                </th>
                <th className="text-left px-6 py-3">
                  <div className="flex items-center gap-1 font-inter font-medium text-xs text-[#667085] whitespace-nowrap">
                    Name
                    <ArrowDownIcon className="w-4 h-4 shrink-0" />
                  </div>
                </th>
                <th className="text-left px-6 py-3">
                  <div className="flex items-center gap-1 font-inter font-medium text-xs text-[#667085] whitespace-nowrap">
                    Subscription
                    <ArrowDownIcon className="w-4 h-4 shrink-0" />
                  </div>
                </th>
                <th className="text-left px-6 py-3">
                  <div className="flex items-center gap-1 font-inter font-medium text-xs text-[#667085] whitespace-nowrap">
                    Start Date
                    <ArrowDownIcon className="w-4 h-4 shrink-0" />
                  </div>
                </th>
                <th className="text-left px-6 py-3">
                  <div className="flex items-center gap-1 font-inter font-medium text-xs text-[#667085] whitespace-nowrap">
                    End Date
                    <ArrowDownIcon className="w-4 h-4 shrink-0" />
                  </div>
                </th>
                <th className="text-left px-6 py-3">
                  <div className="flex items-center gap-1 font-inter font-medium text-xs text-[#667085] whitespace-nowrap">
                    Has Premium?
                    <ArrowDownIcon className="w-4 h-4 shrink-0" />
                  </div>
                </th>
                <th className="text-left px-6 py-3">
                  <div className="flex items-center gap-1 font-inter font-medium text-xs text-[#667085] whitespace-nowrap">
                    Status
                    <ArrowDownIcon className="w-4 h-4 shrink-0" />
                  </div>
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: ROWS_PER_PAGE }, (_, i) => (
                  <tr key={`skeleton-${i}`} className="border-t border-[#EAECF0]">
                    <td className="px-6 py-4 align-middle" style={{ height: ROW_HEIGHT }}>
                      <div className="skeleton-shimmer h-4 w-32 rounded" />
                    </td>
                    <td className="px-6 py-4 align-middle" style={{ height: ROW_HEIGHT }}>
                      <div className="skeleton-shimmer h-4 w-24 rounded" />
                    </td>
                    <td className="px-6 py-4 align-middle" style={{ height: ROW_HEIGHT }}>
                      <div className="skeleton-shimmer h-4 w-16 rounded" />
                    </td>
                    <td className="px-6 py-4 align-middle" style={{ height: ROW_HEIGHT }}>
                      <div className="skeleton-shimmer h-4 w-28 rounded" />
                    </td>
                    <td className="px-6 py-4 align-middle" style={{ height: ROW_HEIGHT }}>
                      <div className="skeleton-shimmer h-4 w-28 rounded" />
                    </td>
                    <td className="px-6 py-4 align-middle" style={{ height: ROW_HEIGHT }}>
                      <div className="skeleton-shimmer h-6 w-10 rounded-[16px]" />
                    </td>
                    <td className="px-6 py-4 align-middle" style={{ height: ROW_HEIGHT }}>
                      <div className="skeleton-shimmer h-6 w-14 rounded-[16px]" />
                    </td>
                    <td className="px-6 py-4 align-middle" style={{ height: ROW_HEIGHT }}>
                      <div className="skeleton-shimmer h-8 w-8 rounded" />
                    </td>
                  </tr>
                ))
              ) : (
                Array.from({ length: ROWS_PER_PAGE }, (_, i) => {
                  const u = users[i];
                  if (!u) {
                    return (
                      <tr key={`empty-${i}`} className="border-t border-[#EAECF0]">
                        <td colSpan={8} className="px-6 align-middle whitespace-nowrap" style={{ height: ROW_HEIGHT }} />
                      </tr>
                    );
                  }
                  return (
                    <tr
                      key={u._id}
                      className="border-t border-[#EAECF0] hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="px-6 py-4 font-inter text-sm text-[#101828] align-middle whitespace-nowrap" style={{ height: ROW_HEIGHT }}>
                        {u.email}
                      </td>
                      <td className="px-6 py-4 font-inter text-sm text-[#101828] align-middle whitespace-nowrap" style={{ height: ROW_HEIGHT }}>
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="px-6 py-4 font-inter text-sm text-[#667085] align-middle whitespace-nowrap" style={{ height: ROW_HEIGHT }}>
                        {PLAN_LABEL[u.subscription?.plan] || "Free"}
                      </td>
                      <td className="px-6 py-4 font-inter text-sm text-[#667085] align-middle whitespace-nowrap" style={{ height: ROW_HEIGHT }}>
                        {fmtDate(u.subscription?.startDate)}
                      </td>
                      <td className="px-6 py-4 font-inter text-sm text-[#667085] align-middle whitespace-nowrap" style={{ height: ROW_HEIGHT }}>
                        {fmtDate(u.subscription?.expiresAt)}
                      </td>
                      <td className="px-6 py-4 align-middle whitespace-nowrap" style={{ height: ROW_HEIGHT }}>
                        {hasPremium(u) ? <TagYes /> : <TagNo />}
                      </td>
                      <td className="px-6 py-4 align-middle whitespace-nowrap" style={{ height: ROW_HEIGHT }}>
                        {u.blocked ? <TagBlocked /> : <TagActive />}
                      </td>
                      <td className="px-6 py-4 align-middle whitespace-nowrap" style={{ height: ROW_HEIGHT }}>
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
            Page {pagination.page} of {Math.max(1, pagination.pages)}
            {pagination.total > 0 && (
              <span className="ml-2 text-[#667085]">
                ({pagination.total} users)
              </span>
            )}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.pages || pagination.pages <= 0}
            onClick={() => fetchUsers(pagination.page + 1)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#D0D5DD] bg-white font-inter font-semibold text-sm text-[#344054] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Next
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
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
              blocked: editUser.blocked,
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
        isBlocked={blockUser?.blocked}
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
