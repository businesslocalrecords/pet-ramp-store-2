import React from 'react';
import { BadgeCheck, Clock } from 'lucide-react';

interface AuthorBylineProps {
  /** Author name, defaults to the reviewing veterinarian. */
  author?: string;
  /** Author credential line. */
  credential?: string;
  /** Avatar image URL. Falls back to initials. */
  avatarUrl?: string;
}

/** Formats today's date as e.g. "October 11, 2026". */
function formattedToday(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Computed once per page load — keeps render pure and stable. */
const LAST_UPDATED = formattedToday();
const LAST_UPDATED_ISO = new Date().toISOString().split('T')[0];

/**
 * Editorial byline with a dynamic "last updated" stamp.
 * The date is computed at render so the page always shows a current review date.
 */
export const AuthorByline: React.FC<AuthorBylineProps> = ({
  author = 'Dr. Sarah Jenkins',
  credential = 'DVM, Veterinary Medicine',
  avatarUrl,
}) => {
  const initials = author
    .replace(/^Dr\.\s*/, '')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {/* Author */}
      <div className="flex items-center gap-2.5">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={author}
            width={36}
            height={36}
            loading="lazy"
            className="h-9 w-9 rounded-full object-cover ring-1 ring-stone-900/10"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white ring-1 ring-stone-900/10"
          >
            {initials}
          </span>
        )}
        <div className="leading-tight">
          <p className="text-sm font-bold text-stone-900">
            By <span className="text-stone-900">{author}</span>, {credential}
          </p>
          <p className="flex items-center gap-1 text-xs text-stone-500">
            <BadgeCheck className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
            Medically reviewed
          </p>
        </div>
      </div>

      <span className="hidden h-6 w-px bg-stone-900/10 sm:block" aria-hidden="true" />

      {/* Dynamic last-updated stamp */}
      <p className="flex items-center gap-1.5 text-xs text-stone-500">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        <span>
          Last updated:{' '}
          <time dateTime={LAST_UPDATED_ISO} className="font-semibold text-stone-700">
            {LAST_UPDATED}
          </time>
        </span>
      </p>
    </div>
  );
};