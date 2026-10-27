/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Web Speech API read-aloud helper with feature detection and graceful fallback
 */

import { Language } from '../types/index.ts';

export interface SpeechCapability {
  isSupported: boolean;
  hasVoiceForLanguage: boolean;
  voiceName?: string;
}

export function detectSpeechCapability(lang: Language): SpeechCapability {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return { isSupported: false, hasVoiceForLanguage: false };
  }

  const langCode = lang === 'ta' ? 'ta-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
  const voices = window.speechSynthesis.getVoices();
  const matched = voices.find(
    (v) => v.lang.toLowerCase().startsWith(langCode.toLowerCase()) || v.lang.toLowerCase().startsWith(lang)
  );

  return {
    isSupported: true,
    hasVoiceForLanguage: Boolean(matched),
    voiceName: matched?.name,
  };
}

export function speakText(
  text: string,
  lang: Language = 'en',
  rate: number = 0.95,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const langCode = lang === 'ta' ? 'ta-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
  utterance.lang = langCode;
  utterance.rate = rate;

  const voices = window.speechSynthesis.getVoices();
  const matched = voices.find(
    (v) => v.lang.toLowerCase().startsWith(langCode.toLowerCase()) || v.lang.toLowerCase().startsWith(lang)
  );
  if (matched) {
    utterance.voice = matched;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
