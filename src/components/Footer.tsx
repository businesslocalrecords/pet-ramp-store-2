import React from 'react';
import { PawPrint, Mail, Phone, MapPin, Camera, Globe, Play, Truck, RotateCcw, ShieldCheck } from 'lucide-react';

/**
 * ---------------------------------------------------------------------------
 * REPLACE THESE BEFORE RUNNING PAID TRAFFIC
 * ---------------------------------------------------------------------------
 * Google Merchant Center / PMax requires a real, verifiable business identity
 * on the landing page. These are deliberately OBVIOUS placeholders: a fake
 * address is worse than a missing one, and the banner below will keep showing
 * until every field is filled in with real values.
 */
const BUSINESS = {
  legalName: 'PawGrip Pro',
  addressLine1: 'REPLACE_WITH_STREET_ADDRESS',
  addressLine2: 'REPLACE_WITH_SUITE_OR_UNIT',
  city: 'REPLACE_WITH_CITY',
  state: 'REPLACE_WITH_STATE',
  postalCode: 'REPLACE_WITH_ZIP',
  country: 'United States',
  email: 'support@pawgrippro.com',
  phone: 'REPLACE_WITH_PHONE_NUMBER',
};

/** True while any required field is still an unfilled placeholder. */
const IS_INCOMPLETE =
  BUSINESS.addressLine1.startsWith('REPLACE_') ||
  BUSINESS.city.startsWith('REPLACE_') ||
  BUSINESS.state.startsWith('REPLACE_') ||
  BUSINESS.postalCode.startsWith('REPLACE_') ||
  BUSINESS.phone.startsWith('REPLACE_');

const CURRENT_YEAR = new Date().getFullYear();

const linkGroups = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Compare', href: '#compare' },
      { label: 'Owner Videos', href: '#ugc' },
      { label: 'Reviews', href: '#reviews' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Shipping & Returns', href: '#shipping' },
      { label: 'Track My Order', href: '#' },
      { label: 'Contact Us', href: `mailto:${BUSINESS.email}` },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Warranty', href: '#shipping' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Refund Policy', href: '#shipping' },
    ],
  },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-950 text-stone-400">
      {/* Dev warning while business details are placeholders */}
      {IS_INCOMPLETE && (
        <div className="border-b border-amber-500/30 bg-amber-950/40 px-4 py-2.5 text-center text-[11px] font-medium text-amber-300">
          Developer notice: business address and phone are still placeholders.
          Replace the <code className="font-mono">BUSINESS</code> object in{' '}
          <code className="font-mono">src/components/Footer.tsx</code> before
          running Google Ads / PMax.
        </div>
      )}

      {/* Final CTA */}
      <div className="border-b border-stone-800">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Give Your Dog a Pain-Free Ride
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-stone-400">
            Join 12,000+ owners who stopped lifting their dogs into the car.
            30-day risk-free trial, free shipping, free returns.
          </p>
          <a
            href="#offer"
            className="mt-7 inline-flex items-center gap-2 rounded-md bg-[#F37021] px-9 py-4 text-lg font-bold text-white shadow-sm transition-colors hover:bg-[#D95E1A]"
          >
            Get the PawGrip Pro
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-5">
          {/* Brand + verified business identity */}
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500">
                <PawPrint className="h-6 w-6 text-stone-900" aria-hidden="true" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                {BUSINESS.legalName}
              </span>
            </div>

            {/* Physical address — required for Merchant Center trust */}
            <address className="space-y-1.5 text-sm not-italic">
              <span className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                <span>
                  {BUSINESS.addressLine1}
                  <br />
                  {BUSINESS.addressLine2}
                  <br />
                  {BUSINESS.city}, {BUSINESS.state} {BUSINESS.postalCode}
                  <br />
                  {BUSINESS.country}
                </span>
              </span>
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                <a href={`mailto:${BUSINESS.email}`} className="hover:text-amber-400">
                  {BUSINESS.email}
                </a>
              </span>
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                <a href={`tel:${BUSINESS.phone.replace(/[^\d+]/g, '')}`} className="hover:text-amber-400">
                  {BUSINESS.phone}
                </a>
              </span>
            </address>

            <div className="mt-6 flex flex-wrap gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-amber-500" aria-hidden="true" /> Free insured shipping
              </span>
              <span className="flex items-center gap-1.5">
                <RotateCcw className="h-4 w-4 text-amber-500" aria-hidden="true" /> 30-day returns
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-amber-500" aria-hidden="true" /> 1-year warranty
              </span>
            </div>

            <div className="mt-6 flex items-center gap-3">
              {[Camera, Globe, Play].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social profile"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 transition-colors hover:bg-amber-500 hover:text-stone-900"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 text-sm font-bold text-white">{group.title}</h3>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm transition-colors hover:text-amber-400">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-stone-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs sm:flex-row sm:px-6">
          <p>
            &copy; {CURRENT_YEAR} {BUSINESS.legalName}. All rights reserved.
          </p>
          <p className="text-stone-500">
            {BUSINESS.city && !BUSINESS.city.startsWith('REPLACE_')
              ? `Ships from ${BUSINESS.city}, ${BUSINESS.state}`
              : 'Ships from a US fulfillment center'}
          </p>
        </div>
      </div>
    </footer>
  );
};