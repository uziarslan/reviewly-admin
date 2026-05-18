import React from 'react';

/** Subscriptions tab – inherits link color (active + hover). */
export const SubscriptionsIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path opacity="0.4" d="M7.5 7.5H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path fillRule="evenodd" clipRule="evenodd" d="M3.33301 4.16667C3.33301 3.24619 4.07952 2.5 4.99967 2.5H14.9997C15.9198 2.5 16.6663 3.24619 16.6663 4.16667V15.8333C16.6663 16.7538 15.9198 17.5 14.9997 17.5H4.99967C4.07952 17.5 3.33301 16.7538 3.33301 15.8333V4.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.33301 8.33398H16.6663" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Analytics tab icon – bar chart */
export const AnalyticsIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M16.6667 17.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 17.5V2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.33333 17.5V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Exam Schedule tab icon – calendar */
export const CalendarIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M15.8333 3.33398H4.16667C3.24619 3.33398 2.5 4.08018 2.5 5.00065V16.6673C2.5 17.5878 3.24619 18.334 4.16667 18.334H15.8333C16.7538 18.334 17.5 17.5878 17.5 16.6673V5.00065C17.5 4.08018 16.7538 3.33398 15.8333 3.33398Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.3333 1.66602V4.99935" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.66675 1.66602V4.99935" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 8.33398H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** What's New tab icon – megaphone */
export const MegaphoneIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M16.6667 6.66667V13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.33333 8.33333H5L11.6667 4.16667V15.8333L5 11.6667H3.33333C2.8731 11.6667 2.5 11.2936 2.5 10.8333V9.16667C2.5 8.70643 2.8731 8.33333 3.33333 8.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 11.6667V15C5 15.4602 5.3731 15.8333 5.83333 15.8333H7.5C7.96024 15.8333 8.33333 15.4602 8.33333 15V13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SearchIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="#667085" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);

export const FilterIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 10H15M2.5 5H17.5M7.5 15H12.5" stroke="#344054" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);

export const ArrowDownIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.99967 3.33398V12.6673M7.99967 12.6673L12.6663 8.00065M7.99967 12.6673L3.33301 8.00065" stroke="#667085" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);

export const PencilIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_258_5803)">
      <path d="M7.49994 2.50024L9.49994 4.50024M10.587 3.40619C10.8513 3.1419 10.9999 2.78342 10.9999 2.40962C11 2.03581 10.8515 1.6773 10.5872 1.41294C10.3229 1.14859 9.96445 1.00005 9.59064 1C9.21684 0.999953 8.85832 1.1484 8.59397 1.41269L1.92097 8.08719C1.80488 8.20294 1.71902 8.34546 1.67097 8.50219L1.01047 10.6782C0.997545 10.7214 0.996569 10.7674 1.00764 10.8111C1.01872 10.8549 1.04143 10.8948 1.07337 10.9267C1.1053 10.9586 1.14528 10.9812 1.18905 10.9922C1.23282 11.0032 1.27875 11.0022 1.32197 10.9892L3.49847 10.3292C3.65505 10.2816 3.79755 10.1962 3.91347 10.0807L10.587 3.40619Z" stroke="#667085" stroke-linecap="round" stroke-linejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_258_5803">
        <rect width="12" height="12" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const ChevronLeftIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronRightIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CloseIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);