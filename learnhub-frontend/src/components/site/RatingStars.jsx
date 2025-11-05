import React from 'react';

export default function RatingStars({ value = 4.8, reviewCount = 1200, size = 'md' }) {
  const formatCount = (count) => {
    if (!count || count === 0) return '';
    if (count >= 1000) return `(${(count / 1000).toFixed(1)}K)`;
    return `(${count})`;
  };

  const starSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  const showCount = reviewCount !== undefined && reviewCount !== null;

  return (
    <div className="flex items-center gap-1">
      <div className={`flex items-center gap-0.5 text-amber-500`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star <= Math.round(value) ? "currentColor" : "none"} stroke={star <= Math.round(value) ? "currentColor" : "currentColor"} strokeWidth={1} className={`${starSize}`}>
            <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l1.519 3.653a1.25 1.25 0 001.04.77l3.957.34c1.164.1 1.636 1.544.75 2.314l-2.994 2.58a1.25 1.25 0 00-.404 1.28l.9 3.84c.265 1.13-.964 2.02-1.96 1.42l-3.39-2.018a1.25 1.25 0 00-1.29 0l-3.39 2.018c-.996.6-2.225-.29-1.96-1.42l.9-3.84a1.25 1.25 0 00-.404-1.28L3.522 10.3c-.886-.77-.414-2.214.75-2.314l3.957-.34a1.25 1.25 0 001.04-.77l1.519-3.653z" />
          </svg>
        ))}
      </div>
      {showCount && (
        <span className="text-xs font-medium text-gray-700">{formatCount(reviewCount)}</span>
      )}
    </div>
  );
}


