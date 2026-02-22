import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { analyticsAPI } from '../services/api';

const COLORS = ['#6E43B9', '#FFC92A', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899'];

function StatCard({ label, value, sub, color = '#6E43B9' }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-[#F2F4F7]">
      <p className="font-inter text-sm text-[#6C737F] mb-1">{label}</p>
      <p className="font-inter text-2xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="font-inter text-xs text-[#9CA3AF] mt-1">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="font-inter font-semibold text-lg text-[#0F172A] mt-8 mb-4">{children}</h2>;
}

function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border border-[#F2F4F7] ${className}`}>
      <h3 className="font-inter font-medium text-sm text-[#45464E] mb-4">{title}</h3>
      {children}
    </div>
  );
}

function formatDuration(seconds) {
  if (!seconds) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const PERIOD_OPTIONS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

export default function Analytics() {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [exams, setExams] = useState([]);
  const [users, setUsers] = useState(null);
  const [retention, setRetention] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ovRes, exRes, usRes, retRes] = await Promise.all([
        analyticsAPI.getOverview(days),
        analyticsAPI.getExams(days),
        analyticsAPI.getUsers(days),
        analyticsAPI.getRetention(days),
      ]);
      if (ovRes.success) setOverview(ovRes.data);
      if (exRes.success) setExams(exRes.data);
      if (usRes.success) setUsers(usRes.data);
      if (retRes.success) setRetention(retRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-inter font-bold text-xl text-[#0F172A]">Analytics</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-[#F2F4F7] animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-7 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="font-inter text-red-600">{error}</p>
        <button
          onClick={fetchData}
          className="mt-3 font-inter font-medium text-sm text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const planData = overview?.planDistribution?.map((p) => ({
    name: p.plan.charAt(0).toUpperCase() + p.plan.slice(1),
    value: p.count,
  })) || [];

  const hourlyData = users?.activityByHour?.map((h) => ({
    hour: `${String(h._id).padStart(2, '0')}:00`,
    attempts: h.attempts,
    users: h.uniqueUsers,
  })) || [];

  const dailyData = users?.activityByDay?.map((d) => ({
    date: d._id,
    attempts: d.attempts,
    users: d.uniqueUsers,
  })) || [];

  const signupData = users?.signupsByDay?.map((d) => ({
    date: d._id,
    signups: d.count,
  })) || [];

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-inter font-bold text-xl text-[#0F172A]">Analytics</h1>
        <div className="flex items-center gap-2">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`font-inter text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                days === opt.value
                  ? 'bg-[#6E43B9] text-white border-[#6E43B9]'
                  : 'bg-white text-[#6C737F] border-[#E5E7EB] hover:border-[#6E43B9]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={overview?.totalUsers?.toLocaleString() || 0} sub={`+${overview?.newUsersInRange || 0} new`} />
        <StatCard label="Exam Attempts" value={overview?.totalAttempts?.toLocaleString() || 0} sub={`${overview?.completedAttempts || 0} completed`} color="#10B981" />
        <StatCard label="Completion Rate" value={`${overview?.completionRate || 0}%`} color="#F59E0B" />
        <StatCard label="Avg Duration" value={formatDuration(overview?.avgDurationSeconds)} color="#3B82F6" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Users" value={users?.activeUsersCount?.toLocaleString() || 0} sub={`Last ${days} days`} color="#8B5CF6" />
        <StatCard label="Returning Users" value={retention?.returningUsers?.toLocaleString() || 0} sub={`${retention?.returningRate || 0}% return rate`} color="#EC4899" />
        <StatCard label="Avg Exams/User" value={retention?.avgAttemptsPerUser || 0} color="#6E43B9" />
        <StatCard label="New Signups" value={overview?.newUsersInRange?.toLocaleString() || 0} sub={`Last ${days} days`} color="#10B981" />
      </div>

      {/* Charts Row 1 */}
      <SectionTitle>Daily Activity</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Daily Exam Attempts & Active Users">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="attempts" fill="#6E43B9" name="Attempts" radius={[4, 4, 0, 0]} />
              <Bar dataKey="users" fill="#FFC92A" name="Unique Users" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="New Signups Over Time">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={signupData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="signups" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <SectionTitle>Usage Patterns</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Activity by Hour of Day">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="attempts" fill="#8B5CF6" name="Attempts" radius={[4, 4, 0, 0]} />
              <Bar dataKey="users" fill="#FFC92A" name="Users" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Subscription Plans">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={planData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {planData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Exam Analytics Table */}
      <SectionTitle>Exam Performance</SectionTitle>
      <div className="bg-white rounded-xl shadow-sm border border-[#F2F4F7] overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#F2F4F7]">
              <th className="font-inter font-medium text-xs text-[#6C737F] uppercase tracking-wider py-3 px-4">Exam</th>
              <th className="font-inter font-medium text-xs text-[#6C737F] uppercase tracking-wider py-3 px-4 text-right">Attempts</th>
              <th className="font-inter font-medium text-xs text-[#6C737F] uppercase tracking-wider py-3 px-4 text-right">Completed</th>
              <th className="font-inter font-medium text-xs text-[#6C737F] uppercase tracking-wider py-3 px-4 text-right">Completion %</th>
              <th className="font-inter font-medium text-xs text-[#6C737F] uppercase tracking-wider py-3 px-4 text-right">Avg Score</th>
              <th className="font-inter font-medium text-xs text-[#6C737F] uppercase tracking-wider py-3 px-4 text-right">Pass Rate</th>
              <th className="font-inter font-medium text-xs text-[#6C737F] uppercase tracking-wider py-3 px-4 text-right">Avg Duration</th>
            </tr>
          </thead>
          <tbody>
            {exams.length === 0 ? (
              <tr>
                <td colSpan={7} className="font-inter text-sm text-[#9CA3AF] text-center py-8">
                  No exam data for this period
                </td>
              </tr>
            ) : (
              exams.map((exam) => (
                <tr key={exam.reviewerId} className="border-b border-[#F2F4F7] hover:bg-[#FAFAFE] transition-colors">
                  <td className="font-inter text-sm text-[#0F172A] py-3 px-4 font-medium">{exam.reviewerName}</td>
                  <td className="font-inter text-sm text-[#45464E] py-3 px-4 text-right">{exam.totalAttempts}</td>
                  <td className="font-inter text-sm text-[#45464E] py-3 px-4 text-right">{exam.completedAttempts}</td>
                  <td className="font-inter text-sm py-3 px-4 text-right">
                    <span className={`font-medium ${exam.completionRate >= 70 ? 'text-green-600' : exam.completionRate >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {exam.completionRate}%
                    </span>
                  </td>
                  <td className="font-inter text-sm text-[#45464E] py-3 px-4 text-right">{exam.avgScore}%</td>
                  <td className="font-inter text-sm py-3 px-4 text-right">
                    <span className={`font-medium ${exam.passRate >= 70 ? 'text-green-600' : exam.passRate >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {exam.passRate}%
                    </span>
                  </td>
                  <td className="font-inter text-sm text-[#45464E] py-3 px-4 text-right">{formatDuration(exam.avgDurationSeconds)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Top Users Table */}
      <SectionTitle>Most Active Users</SectionTitle>
      <div className="bg-white rounded-xl shadow-sm border border-[#F2F4F7] overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#F2F4F7]">
              <th className="font-inter font-medium text-xs text-[#6C737F] uppercase tracking-wider py-3 px-4">User</th>
              <th className="font-inter font-medium text-xs text-[#6C737F] uppercase tracking-wider py-3 px-4">Email</th>
              <th className="font-inter font-medium text-xs text-[#6C737F] uppercase tracking-wider py-3 px-4 text-right">Attempts</th>
              <th className="font-inter font-medium text-xs text-[#6C737F] uppercase tracking-wider py-3 px-4 text-right">Completed</th>
              <th className="font-inter font-medium text-xs text-[#6C737F] uppercase tracking-wider py-3 px-4 text-right">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {(!retention?.topUsers || retention.topUsers.length === 0) ? (
              <tr>
                <td colSpan={5} className="font-inter text-sm text-[#9CA3AF] text-center py-8">
                  No user data for this period
                </td>
              </tr>
            ) : (
              retention.topUsers.map((user) => (
                <tr key={user.userId} className="border-b border-[#F2F4F7] hover:bg-[#FAFAFE] transition-colors">
                  <td className="font-inter text-sm text-[#0F172A] py-3 px-4 font-medium">{user.name}</td>
                  <td className="font-inter text-sm text-[#6C737F] py-3 px-4">{user.email}</td>
                  <td className="font-inter text-sm text-[#45464E] py-3 px-4 text-right">{user.attemptCount}</td>
                  <td className="font-inter text-sm text-[#45464E] py-3 px-4 text-right">{user.completedCount}</td>
                  <td className="font-inter text-sm text-[#6C737F] py-3 px-4 text-right">
                    {user.lastAttempt ? new Date(user.lastAttempt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Login Frequency (from PostHog) */}
      {retention?.loginFrequency && retention.loginFrequency.length > 0 && (
        <>
          <SectionTitle>Login Frequency (PostHog)</SectionTitle>
          <ChartCard title={`Top logins in the last ${days} days`}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={retention.loginFrequency.slice(0, 15)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="userId" type="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="loginCount" fill="#6E43B9" name="Logins" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}
    </div>
  );
}
