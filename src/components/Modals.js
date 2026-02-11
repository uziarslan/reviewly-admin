import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon } from './Icons';
import FloatingField from './FloatingField';

const DATE_DISPLAY_FORMAT = { year: 'numeric', month: 'long', day: 'numeric' };
const parseDisplayDate = (str) => (str ? new Date(str) : null);
const formatDisplayDate = (date) => (date ? date.toLocaleDateString('en-US', DATE_DISPLAY_FORMAT) : '');
const toInputValue = (date) => (date ? date.toISOString().slice(0, 10) : '');

/** FloatingField-styled date picker using native input[type="date"] */
function FloatingDateInput({ label, id, value, onChange }) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const displayValue = formatDisplayDate(value);
  const active = focused || displayValue !== '';
  const labelClass = `absolute left-3 pointer-events-none transition-all duration-200 origin-left text-[#6C737F] font-inter font-medium z-10 ${active ? 'top-[6px] text-[11px] tracking-[0.15px]' : 'top-1/2 -translate-y-1/2 text-sm'}`;
  const containerClass = `relative w-full h-12 rounded-lg border border-[#D2D6DB] bg-white font-inter font-medium text-sm tracking-[0.15px] text-[#111927] cursor-pointer ${active ? 'pt-5 pb-1 px-3' : 'py-3 px-3'} focus-within:border-[#6E43B9] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#6E43B9]/30`;
  return (
    <div
      className={containerClass}
      onClick={() => inputRef.current?.showPicker?.()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.showPicker?.()}
    >
      <label htmlFor={id} className={labelClass}>{label}</label>
      {displayValue && <span className="block pt-1 text-[#111927]">{displayValue}</span>}
      <input
        ref={inputRef}
        id={id}
        type="date"
        value={toInputValue(value)}
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value + 'T12:00:00') : null)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label={label}
      />
    </div>
  );
}

const BACKDROP_CLASS = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
const CARD_CLASS = 'bg-white rounded-[16px] shadow-[0_2px_12px_0_rgba(20,20,43,0.08)] backdrop-blur max-h-[95vh] overflow-y-auto w-full max-w-lg p-[24px]';

function ModalBase({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={BACKDROP_CLASS} role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={onClose}>
      <div className={CARD_CLASS} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-[16px]">
          <h2
            id="modal-title"
            className="font-inter font-medium text-[18px] text-[#45464E]"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#667085] hover:bg-[#F2F4F7] hover:text-[#344054] transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/**
 * Edit Subscription modal: user info (read-only), subscription type radios, duration dates, Save/Cancel, danger zone (Block user / Delete account).
 * Props: isOpen, onClose, data = { email, name, subscription, startDate, endDate }, onSave(payload), onBlockUser, onDeleteAccount
 */
export function EditSubscriptionModal({
  isOpen,
  onClose,
  data = {},
  onSave,
  onBlockUser,
  onDeleteAccount,
}) {
  const { email = '', name = '', subscription = 'Quarterly', startDate = '', endDate = '' } = data;
  const [subscriptionType, setSubscriptionType] = useState(subscription);
  const [start, setStart] = useState(parseDisplayDate(startDate));
  const [end, setEnd] = useState(parseDisplayDate(endDate));

  useEffect(() => {
    if (isOpen) {
      setSubscriptionType(subscription);
      setStart(parseDisplayDate(startDate));
      setEnd(parseDisplayDate(endDate));
    }
  }, [isOpen, subscription, startDate, endDate]);

  const handleSave = () => {
    onSave?.({ subscriptionType, startDate: formatDisplayDate(start), endDate: formatDisplayDate(end) });
    onClose();
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Edit Subscription">
      <div className="space-y-[16px]">
        <div>
          <label className="block font-inter font-semibold text-[14px] text-[#45464E]">Email address</label>
          <p className="font-inter font-normal text-[14px] text-[#45464E]">{email}</p>
        </div>
        <div>
          <label className="block font-inter font-semibold text-[14px] text-[#45464E]">Name</label>
          <p className="font-inter font-normal text-[14px] text-[#45464E]">{name}</p>
        </div>

        <div>
          <h3 className="font-inter font-semibold text-[14px] text-[#45464E] mb-3">Subscription Type</h3>
          <div className="space-y-2">
            {['Free', 'Weekly', 'Monthly', 'Quarterly'].map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="subscriptionType"
                  value={opt}
                  checked={subscriptionType === opt}
                  onChange={() => setSubscriptionType(opt)}
                  className="w-4 h-4 text-[#6E43B9] border-[#D0D5DD] focus:ring-[#6E43B9]"
                />
                <span className="font-inter text-[14px] text-[#344054]">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-inter font-semibold text-[14px] text-[#45464E] mb-3">Duration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FloatingDateInput
                label="Start Date"
                id="edit-start-date"
                value={start}
                onChange={setStart}
              />
            </div>
            <div>
              <FloatingDateInput
                label="End Date"
                id="edit-end-date"
                value={end}
                onChange={setEnd}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-[24px]">
          <button
            type="button"
            onClick={onClose}
            className="px-[16px] py-[11.5px] rounded-[8px] border border-[#431C86] bg-white font-inter font-medium text-[14px] text-[#431C86] hover:bg-[#F5F3FF] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-[24px] py-[11.5px] rounded-[8px] bg-[#FDB022] font-inter font-bold text-[14px] text-[#421A83] hover:opacity-90 transition-opacity"
          >
            Save Changes
          </button>
        </div>

        <div className="pt-6 border-t border-[#EAECF0]">
          <h3 className="font-inter font-semibold text-[14px] text-[#45464E] mb-1">Danger zone</h3>
          <p className="font-inter font-normal text-[14px] text-[#45464E] mb-3">These actions are irreversible or restrict access.</p>
          <div className="flex flex-col items-start gap-[8px]">
            <button
              type="button"
              onClick={() => onBlockUser?.()}
              className="font-inter font-medium text-[14px] text-[#FF383C]"
            >
              Block user
            </button>
            <button
              type="button"
              onClick={() => onDeleteAccount?.()}
              className="font-inter font-medium text-[14px] text-[#FF383C]"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>
    </ModalBase>
  );
}

/**
 * Block user confirmation modal.
 * Props: isOpen, onClose, onConfirm
 */
export function BlockUserModal({ isOpen, onClose, onConfirm }) {
  const handleBlock = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Block user?">
      <div className="space-y-[24px]">
        <p className="font-inter text-[14px] text-[#344054]">
          The user will no longer be able to log in or access Reviewly.<br />You can unblock them later.
        </p>
        <div className="flex justify-end gap-[24px]">
          <button
            type="button"
            onClick={onClose}
            className="px-[16px] py-[11.5px] rounded-[8px] border border-[#431C86] bg-white font-inter font-medium text-[14px] text-[#431C86] hover:bg-[#F5F3FF] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleBlock}
            className="px-[24px] py-[11.5px] rounded-[8px] bg-[#CC2D30] font-inter font-bold text-[14px] text-white hover:opacity-90 transition-opacity"
          >
            Block user
          </button>
        </div>
      </div>
    </ModalBase>
  );
}

/**
 * Delete account confirmation modal; requires typing the user's email to confirm.
 * Props: isOpen, onClose, userEmail, onConfirm
 */
export function DeleteAccountModal({ isOpen, onClose, userEmail = '', onConfirm }) {
  const [confirmEmail, setConfirmEmail] = useState('');

  useEffect(() => {
    if (isOpen) setConfirmEmail('');
  }, [isOpen]);

  const canDelete = confirmEmail.trim().toLowerCase() === userEmail.trim().toLowerCase();

  const handleDelete = () => {
    if (!canDelete) return;
    onConfirm?.();
    onClose();
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Delete account?">
      <div className="space-y-6">
        <p className="font-inter text-[14px] text-[#344054]">
          This action permanently removes the user from active systems.<br />This cannot be undone.
        </p>
        <div>
          <p className="font-inter font-semibold text-[14px] text-[#45464E] mb-[8px]">
            Type the user's email to confirm:
          </p>
          <FloatingField
            id="delete-account-confirm-email"
            label="Email"
            type="email"
            value={confirmEmail}
            onChange={setConfirmEmail}
          />
        </div>
        <div className="flex justify-end gap-[24px]">
          <button
            type="button"
            onClick={onClose}
            className="px-[16px] py-[11.5px] rounded-[8px] border border-[#431C86] bg-white font-inter font-medium text-[14px] text-[#431C86] hover:bg-[#F5F3FF] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!canDelete}
            className="px-[24px] py-[11.5px] rounded-[8px] bg-[#CC2D30] font-inter font-bold text-[14px] text-white hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none transition-opacity"
          >
            Yes, Delete Account
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
