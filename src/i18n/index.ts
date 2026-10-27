/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../types/index.ts';
import enDict from './locales/en.json';
import taDict from './locales/ta.json';
import hiDict from './locales/hi.json';

const dictionaries: Record<Language, Record<string, string>> = {
  en: enDict,
  ta: taDict,
  hi: hiDict,
};

export function t(key: string, lang: Language = 'en', fallbackText?: string): string {
  const dict = dictionaries[lang] || dictionaries.en;
  if (dict[key]) return dict[key];
  if (dictionaries.en[key]) return dictionaries.en[key];
  return fallbackText || key;
}

/**
 * Localizes Indian Rupee formatting with Lakh/Crore grouping (e.g. ₹ 1,42,000)
 */
export function formatINR(amountPaise: number): string {
  const rupees = amountPaise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(rupees);
}

/**
 * Localizes hours
 */
export function formatHours(hours: number): string {
  return `${hours.toFixed(1)} hrs`;
}
