import React, { useEffect, useState } from 'react';
import DashNav from '../components/DashNav';
import { settingsAPI } from '../services/api';

/** Format an ISO string as YYYY-MM-DD for an <input type="date"> field. */
function toInputDateValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Days between today (00:00) and a target date (00:00). */
function daysUntil(iso) {
  if (!iso) return null;
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  const a = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const b = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

/** Pretty-format a date (or '—' if null/invalid). */
function prettyDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ExamSchedule() {
  const [examDate, setExamDate] = useState(null); // ISO string from server
  const [updatedAt, setUpdatedAt] = useState(null);
  const [inputDate, setInputDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await settingsAPI.getCseExamDate();
      if (res.success) {
        setExamDate(res.data.cseExamDate || null);
        setUpdatedAt(res.data.updatedAt || null);
        setInputDate(toInputDateValue(res.data.cseExamDate));
      } else {
        setError(res.message || 'Failed to load exam date');
      }
    } catch (err) {
      setError(err.message || 'Failed to load exam date');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e?.preventDefault?.();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      // <input type="date"> gives "YYYY-MM-DD". Send as ISO so the server can
      // parse unambiguously.
      const iso = inputDate ? new Date(`${inputDate}T00:00:00`).toISOString() : null;
      const res = await settingsAPI.updateCseExamDate(iso);
      if (res.success) {
        setExamDate(res.data.cseExamDate || null);
        setUpdatedAt(res.data.updatedAt || null);
        setSavedAt(Date.now());
        setTimeout(() => setSavedAt(null), 2000);
      } else {
        setError(res.message || 'Failed to save');
      }
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await settingsAPI.updateCseExamDate(null);
      if (res.success) {
        setExamDate(null);
        setUpdatedAt(res.data.updatedAt || null);
        setInputDate('');
        setSavedAt(Date.now());
        setTimeout(() => setSavedAt(null), 2000);
      } else {
        setError(res.message || 'Failed to clear');
      }
    } catch (err) {
      setError(err.message || 'Failed to clear');
    } finally {
      setSaving(false);
    }
  };

  const days = daysUntil(examDate);
  const daysLabel = (() => {
    if (days == null) return null;
    if (days < 0) return `Was ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`;
    if (days === 0) return 'Exam Day';
    return `${days} day${days === 1 ? '' : 's'} from today`;
  })();

  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <DashNav />
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-6">
        <div className="max-w-[640px]">
          <h1 className="font-inter font-bold text-[22px] text-[#0F172A] mb-1">
            Exam Schedule
          </h1>
          <p className="font-inter text-[13px] text-[#6C737F] mb-6">
            Set the next Civil Service Exam (CSE) date. Users see a live "X days
            before CSE" countdown on their dashboard Readiness Checker.
          </p>

          <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-6">
            {/* Current value */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-[#F2F4F7]">
              <div>
                <p className="font-inter text-[12px] text-[#6C737F] uppercase tracking-wide mb-1">
                  Current exam date
                </p>
                <p className="font-inter font-semibold text-[15px] text-[#0F172A]">
                  {loading ? '…' : prettyDate(examDate)}
                </p>
                {updatedAt && (
                  <p className="font-inter text-[11px] text-[#9CA3AF] mt-1">
                    Last updated {new Date(updatedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div>
                <p className="font-inter text-[12px] text-[#6C737F] uppercase tracking-wide mb-1">
                  Countdown
                </p>
                <p className={`font-inter font-bold text-[20px] ${
                  days == null ? 'text-[#9CA3AF]'
                  : days < 0 ? 'text-[#DC2626]'
                  : days <= 7 ? 'text-[#D97706]'
                  : 'text-[#6E43B9]'
                }`}>
                  {daysLabel || '—'}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave}>
              <label className="block font-inter font-semibold text-[13px] text-[#0F172A] mb-2">
                Next CSE exam date
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="date"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  disabled={saving || loading}
                  className="font-inter text-[14px] text-[#0F172A] border border-[#D1D5DB] rounded-[8px] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6E43B9]/20 focus:border-[#6E43B9] disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={saving || loading}
                  className="font-inter font-semibold text-[13px] text-white bg-[#6E43B9] hover:bg-[#5C36A0] active:bg-[#4B2D85] px-5 py-2.5 rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                {examDate && (
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={saving || loading}
                    className="font-inter font-medium text-[13px] text-[#DC2626] bg-white border border-[#FCA5A5] hover:bg-[#FEF2F2] px-4 py-2.5 rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear
                  </button>
                )}
              </div>

              <p className="font-inter text-[12px] text-[#6C737F] mt-3">
                Leave the date empty and click Clear to hide the countdown on the
                user dashboard.
              </p>

              {error && (
                <p className="font-inter text-[13px] text-[#DC2626] mt-3">{error}</p>
              )}
              {savedAt && !error && (
                <p className="font-inter text-[13px] text-[#16A34A] mt-3">Saved.</p>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
