import React from 'react';

export default function RatingStars({ value = 4.8 }) {
  return (
    <div className="flex items-center gap-1 text-amber-500">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l1.519 3.653a1.25 1.25 0 001.04.77l3.957.34c1.164.1 1.636 1.544.75 2.314l-2.994 2.58a1.25 1.25 0 00-.404 1.28l.9 3.84c.265 1.13-.964 2.02-1.96 1.42l-3.39-2.018a1.25 1.25 0 00-1.29 0l-3.39 2.018c-.996.6-2.225-.29-1.96-1.42l.9-3.84a1.25 1.25 0 00-.404-1.28L3.522 10.3c-.886-.77-.414-2.214.75-2.314l3.957-.34a1.25 1.25 0 001.04-.77l1.519-3.653z" />
      </svg>
      <span className="text-xs font-medium text-gray-700">{value.toFixed(1)}</span>
    </div>
  );
}


