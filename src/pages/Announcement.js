import React, { useEffect, useState, useRef } from 'react';
import DashNav from '../components/DashNav';
import { announcementEntriesAPI, announcementAPI } from '../services/api';

const TYPE_OPTIONS = [
  { value: 'new', label: 'NEW' },
  { value: 'improved', label: 'IMPROVED' },
  { value: 'bugfix', label: 'BUG FIX' },
  { value: 'announcement', label: 'ANNOUNCEMENT' },
];

const TYPE_PILL = {
  new: 'bg-[#06A561]/10 text-[#06A561]',
  improved: 'bg-[#FF7300]/10 text-[#FF7300]',
  bugfix: 'bg-[#EC4899]/10 text-[#EC4899]',
  announcement: 'bg-[#FFFCF4] text-[#9D8233]',
};

const todayDate = new Date().toISOString().slice(0, 10);
function formatInputDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? todayDate : d.toISOString().slice(0, 10);
}

const EMPTY_FORM = {
  type: 'new',
  feedbackTag: false,
  title: '',
  description: '',
  publishedAt: todayDate,
};

function prettyDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

const PLACEHOLDER = `Starting June 1, Full Mock Exams will move to Premium to support a more structured and focused review experience during peak CSE season. <a href="https://reviewly.ph/dashboard/whats-new">Read More</a>`;

export default function Announcement() {
  /* ── Banner state ── */
  const [bannerText, setBannerText] = useState('');
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerError, setBannerError] = useState(null);
  const [bannerSavedAt, setBannerSavedAt] = useState(null);

  /* ── Entries state ── */
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const fileRef = useRef(null);

  /* ── Load banner ── */
  useEffect(() => {
    announcementAPI.get()
      .then((r) => {
        if (r.success) {
          setBannerText(r.data.text || '');
          setBannerEnabled(r.data.enabled ?? false);
        }
      })
      .catch(() => {})
      .finally(() => setBannerLoading(false));
  }, []);

  /* ── Load entries ── */
  const loadEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await announcementEntriesAPI.getAll();
      if (res.success) setEntries(res.entries || []);
      else setError(res.message || 'Failed to load');
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEntries(); }, []);

  /* ── Banner helpers ── */
  const saveBanner = async (overrides = {}) => {
    if (bannerSaving) return;
    setBannerSaving(true);
    setBannerError(null);
    const payload = { text: bannerText.trim() || null, enabled: bannerEnabled, ...overrides };
    try {
      const res = await announcementAPI.update(payload.text, payload.enabled);
      if (res.success) {
        setBannerText(res.data.text || '');
        setBannerEnabled(res.data.enabled ?? false);
        setBannerSavedAt(Date.now());
        setTimeout(() => setBannerSavedAt(null), 2000);
      } else {
        setBannerError(res.message || 'Failed to save');
      }
    } catch (err) {
      setBannerError(err.message || 'Failed to save');
    } finally {
      setBannerSaving(false);
    }
  };

  const handleToggle = () => {
    const next = !bannerEnabled;
    setBannerEnabled(next);
    saveBanner({ enabled: next });
  };

  /* ── Entry helpers ── */
  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setExistingImageUrl('');
    setRemoveImage(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const startEdit = (entry) => {
    setEditingId(entry._id);
    setForm({
      type: entry.type,
      feedbackTag: !!entry.feedbackTag,
      title: entry.title || '',
      description: entry.description || '',
      publishedAt: formatInputDate(entry.publishedAt),
    });
    setImageFile(null);
    setExistingImageUrl(entry.imageUrl || '');
    setRemoveImage(false);
    if (fileRef.current) fileRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildFormData = (status) => {
    const fd = new FormData();
    fd.append('type', form.type);
    fd.append('feedbackTag', form.feedbackTag ? 'true' : 'false');
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('status', status);
    fd.append('publishedAt', form.publishedAt || '');
    if (imageFile) fd.append('image', imageFile);
    if (editingId && removeImage && !imageFile) fd.append('removeImage', 'true');
    return fd;
  };

  const submit = async (status) => {
    if (saving) return;
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const fd = buildFormData(status);
      const res = editingId
        ? await announcementEntriesAPI.update(editingId, fd)
        : await announcementEntriesAPI.create(fd);
      if (res.success) {
        setSavedMsg(status === 'published' ? 'Published.' : 'Saved as draft.');
        setTimeout(() => setSavedMsg(null), 2500);
        resetForm();
        loadEntries();
      } else {
        setError(res.message || 'Failed to save');
      }
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (entry) => {
    try {
      const fd = new FormData();
      fd.append('status', entry.status === 'published' ? 'draft' : 'published');
      const res = await announcementEntriesAPI.update(entry._id, fd);
      if (res.success) loadEntries();
      else setError(res.message || 'Failed to update');
    } catch (err) {
      setError(err.message || 'Failed to update');
    }
  };

  const deleteEntry = async (entry) => {
    try {
      const res = await announcementEntriesAPI.remove(entry._id);
      if (res.success) {
        if (editingId === entry._id) resetForm();
        loadEntries();
      } else setError(res.message || 'Failed to delete');
    } catch (err) {
      setError(err.message || 'Failed to delete');
    } finally {
      setPendingDelete(null);
    }
  };

  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : '';
  const showImage = previewUrl || (!removeImage && existingImageUrl ? existingImageUrl : '');

  const inputCls =
    'w-full font-inter text-[14px] text-[#0F172A] border border-[#D1D5DB] rounded-[8px] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6E43B9]/20 focus:border-[#6E43B9] disabled:bg-[#F9FAFB]';

  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <DashNav />
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-6">
        <h1 className="font-inter font-bold text-[22px] text-[#0F172A] mb-1">Announcement</h1>
        <p className="font-inter text-[13px] text-[#6C737F] mb-6">
          Manage the yellow banner and publish product update entries for users.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Left column: banner + new entry form ── */}
          <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-6 h-fit flex flex-col gap-6">

            {/* Banner section */}
            <div>
              <h2 className="font-inter font-bold text-[16px] text-[#0F172A] mb-4">Announcement banner</h2>

              {/* Toggle */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#F2F4F7] mb-4">
                <div>
                  <p className="font-inter font-semibold text-[13px] text-[#0F172A]">Show banner</p>
                  <p className="font-inter text-[12px] text-[#6C737F] mt-0.5">
                    {bannerEnabled ? 'Live on Dashboard and All Reviewers.' : 'Hidden from users.'}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={bannerEnabled}
                  onClick={handleToggle}
                  disabled={bannerSaving || bannerLoading}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    bannerEnabled ? 'bg-[#6E43B9]' : 'bg-[#D1D5DB]'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${bannerEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Banner text form */}
              <form onSubmit={(e) => { e.preventDefault(); saveBanner(); }} className="flex flex-col gap-3">
                <div>
                  <label className="block font-inter font-semibold text-[13px] text-[#0F172A] mb-2">Banner text</label>
                  <textarea
                    value={bannerText}
                    onChange={(e) => setBannerText(e.target.value)}
                    disabled={bannerSaving || bannerLoading}
                    placeholder={PLACEHOLDER}
                    rows={4}
                    className="w-full font-inter text-[14px] text-[#0F172A] border border-[#D1D5DB] rounded-[8px] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6E43B9]/20 focus:border-[#6E43B9] disabled:bg-[#F9FAFB] disabled:cursor-not-allowed resize-y"
                  />
                  <p className="font-inter text-[12px] text-[#6C737F] mt-1.5">
                    Add <code className="bg-[#F1F5F9] px-1 rounded">{'<a href="...">Read More</a>'}</code> — renders as a purple link.
                  </p>
                </div>

                {bannerText.trim() && (
                  <div className="rounded-[8px] border border-[#FFE082] bg-[#FFF6DC] px-4 py-3">
                    <p className="font-inter text-[12px] text-[#6C737F] uppercase tracking-wide mb-1">Preview</p>
                    <p
                      className="font-inter text-[13px] text-[#0F172A] [&_a]:font-semibold [&_a]:text-[#6E43B9] [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: bannerText }}
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" disabled={bannerSaving || bannerLoading} className="font-inter font-semibold text-[13px] text-white bg-[#6E43B9] hover:bg-[#5C36A0] px-5 py-2.5 rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {bannerSaving ? 'Saving…' : 'Save'}
                  </button>
                  {bannerText.trim() && (
                    <button type="button" onClick={() => { setBannerText(''); saveBanner({ text: null }); }} disabled={bannerSaving || bannerLoading} className="font-inter font-medium text-[13px] text-[#DC2626] bg-white border border-[#FCA5A5] hover:bg-[#FEF2F2] px-4 py-2.5 rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      Clear text
                    </button>
                  )}
                </div>
                {bannerError && <p className="font-inter text-[13px] text-[#DC2626]">{bannerError}</p>}
                {bannerSavedAt && !bannerError && <p className="font-inter text-[13px] text-[#16A34A]">Saved.</p>}
              </form>
            </div>

            {/* Divider */}
            <div className="border-t border-[#F2F4F7]" />

            {/* New entry form */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-inter font-bold text-[16px] text-[#0F172A]">
                  {editingId ? 'Edit entry' : 'New entry'}
                </h2>
                {editingId && (
                  <button type="button" onClick={resetForm} className="font-inter text-[13px] text-[#6E43B9] hover:underline">
                    + Create new instead
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-inter font-semibold text-[13px] text-[#0F172A] mb-2">Update type</label>
                  <div className="flex gap-2">
                    {TYPE_OPTIONS.map((opt) => {
                      const active = form.type === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, type: opt.value }))}
                          className={`font-inter font-semibold text-[12px] px-4 py-2 rounded-full transition-all ${
                            active
                              ? `${TYPE_PILL[opt.value]} ring-2 ring-offset-1 ring-[#6E43B9]/30`
                              : 'bg-[#F2F4F7] text-[#6C737F] hover:bg-[#E5E7EB]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.feedbackTag}
                    onChange={(e) => setForm((f) => ({ ...f, feedbackTag: e.target.checked }))}
                    className="w-4 h-4 accent-[#6E43B9]"
                  />
                  <span className="font-inter text-[13px] text-[#0F172A]">Show the "BASED ON USER FEEDBACK" pill</span>
                </label>

                <div>
                  <label className="block font-inter font-semibold text-[13px] text-[#0F172A] mb-2">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    maxLength={120}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Report Question Feature"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block font-inter font-semibold text-[13px] text-[#0F172A] mb-2">Description</label>
                  <textarea
                    value={form.description}
                    rows={5}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Describe the update. Line breaks are preserved."
                    className={`${inputCls} resize-y`}
                  />
                </div>

                <div>
                  <label className="block font-inter font-semibold text-[13px] text-[#0F172A] mb-2">Publish date</label>
                  <input
                    type="date"
                    value={form.publishedAt}
                    onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block font-inter font-semibold text-[13px] text-[#0F172A] mb-2">
                    Image <span className="font-normal text-[#9CA3AF]">(optional · JPG/PNG · max 5 MB)</span>
                  </label>
                  {showImage && (
                    <div className="relative mb-3 inline-block">
                      <img src={showImage} alt="preview" className="max-h-48 rounded-[8px] border border-[#E5E7EB]" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setRemoveImage(true); if (fileRef.current) fileRef.current.value = ''; }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#EC4899] text-white text-sm flex items-center justify-center shadow"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => { const f = e.target.files?.[0] || null; setImageFile(f); if (f) setRemoveImage(false); }}
                    className="block w-full font-inter text-[13px] text-[#6C737F] file:mr-3 file:py-2 file:px-4 file:rounded-[8px] file:border-0 file:bg-[#6E43B9] file:text-white file:font-semibold file:text-[13px] file:cursor-pointer"
                  />
                </div>

                {error && <p className="font-inter text-[13px] text-[#DC2626]">{error}</p>}
                {savedMsg && <p className="font-inter text-[13px] text-[#16A34A]">{savedMsg}</p>}

                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => submit('published')}
                    className="font-inter font-semibold text-[13px] text-white bg-[#6E43B9] hover:bg-[#5C36A0] px-5 py-2.5 rounded-[8px] transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : editingId ? 'Save & Publish' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => submit('draft')}
                    className="font-inter font-medium text-[13px] text-[#6E43B9] bg-white border border-[#6E43B9]/40 hover:bg-[#6E43B9]/5 px-5 py-2.5 rounded-[8px] transition-colors disabled:opacity-50"
                  >
                    Save as draft
                  </button>
                </div>
              </div>
            </div>
          </div>{/* end left card */}

          {/* ── Right column: entries list ── */}
          <div>
            <h3 className="font-inter font-bold text-[16px] text-[#0F172A] mb-4">
              All entries <span className="text-[#9CA3AF] font-normal">({entries.length})</span>
            </h3>
              {loading ? (
                <p className="font-inter text-[14px] text-[#6C737F]">Loading…</p>
              ) : entries.length === 0 ? (
                <p className="font-inter text-[14px] text-[#6C737F]">No entries yet.</p>
              ) : (
                <div className="space-y-3">
                  {entries.map((e) => (
                    <div key={e._id} className="bg-white rounded-[12px] border border-[#E5E7EB] p-4">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`font-inter font-semibold text-[11px] px-2.5 py-1 rounded-full ${TYPE_PILL[e.type]}`}>
                          {TYPE_OPTIONS.find((t) => t.value === e.type)?.label}
                        </span>
                        {e.feedbackTag && (
                          <span className="font-inter font-medium text-[11px] px-2.5 py-1 rounded-full bg-[#F2F4F7] text-[#6C737F]">
                            BASED ON USER FEEDBACK
                          </span>
                        )}
                        <span className={`font-inter font-semibold text-[11px] px-2.5 py-1 rounded-full ${
                          e.status === 'published' ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#F59E0B]/10 text-[#B45309]'
                        }`}>
                          {e.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                        <span className="font-inter text-[12px] text-[#9CA3AF] ml-auto">
                          {e.status === 'published' ? prettyDate(e.publishedAt) : `Created ${prettyDate(e.createdAt)}`}
                        </span>
                      </div>
                      <p className="font-inter font-bold text-[15px] text-[#0F172A]">{e.title}</p>
                      <p className="font-inter text-[13px] text-[#6C737F] whitespace-pre-line line-clamp-3 mt-0.5">{e.description}</p>
                      {e.imageUrl && (
                        <img src={e.imageUrl} alt="" className="mt-2 max-h-32 rounded-[8px] border border-[#F2F4F7]" />
                      )}
                      <div className="flex gap-2 mt-3 pt-3 border-t border-[#F2F4F7]">
                        <button type="button" onClick={() => startEdit(e)} className="font-inter font-medium text-[12px] text-[#6E43B9] hover:underline">Edit</button>
                        <button type="button" onClick={() => togglePublish(e)} className="font-inter font-medium text-[12px] text-[#0F172A] hover:underline">
                          {e.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button type="button" onClick={() => setPendingDelete(e)} className="font-inter font-medium text-[12px] text-[#DC2626] hover:underline ml-auto">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>{/* end grid */}
      </main>

      {/* Delete confirm modal */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-[16px] bg-white p-6 shadow-[0_2px_12px_0_rgba(20,20,43,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-inter font-semibold text-[18px] text-[#111827]">Delete update?</h2>
                <p className="font-inter text-[14px] text-[#475467] mt-2">
                  Are you sure you want to delete "{pendingDelete.title}"? This cannot be undone.
                </p>
              </div>
              <button type="button" onClick={() => setPendingDelete(null)} className="rounded-lg p-2 text-[#667085] hover:bg-[#F2F4F7] transition-colors" aria-label="Close">×</button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setPendingDelete(null)} className="rounded-[8px] border border-[#D1D5DB] bg-white px-4 py-2 text-[13px] font-medium text-[#344054] hover:bg-[#F8FAFC]">Cancel</button>
              <button type="button" onClick={() => deleteEntry(pendingDelete)} className="rounded-[8px] bg-[#DC2626] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#B91C1C] transition-colors">Delete update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
