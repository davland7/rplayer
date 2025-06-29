// src/utils/storage.ts
// General utility functions for localStorage and cookie consent

export const COOKIE_KEY = "rplayer:cookies";
export const VOLUME_KEY = "rplayer:volume";
export const FAVORITES_KEY = "rplayer:favorites";
export const LAST_URL = "rplayer:lastUrl";

export function isCookiesAccepted(): boolean {
	return localStorage.getItem(COOKIE_KEY) === "true";
}

export function getLocalStorageItem<T = string>(key: string, fallback?: T): T | null {
	try {
		const value = localStorage.getItem(key);
		if (value === null) return fallback ?? null;
		return typeof fallback === "number" ? (Number(value) as T) : (value as T);
	} catch {
		return fallback ?? null;
	}
}

export function setLocalStorageItem(key: string, value: string | number): void {
	if (isCookiesAccepted()) {
		localStorage.setItem(key, String(value));
	}
}

// Get the player volume from localStorage, fallback to 0.5 if not set or invalid
export function getVolume(): number {
	const stored = localStorage.getItem(VOLUME_KEY);
	if (stored !== null && !Number.isNaN(Number(stored))) {
		const v = Number(stored);
		return Math.max(0, Math.min(1, v));
	}
	return 0.5;
}

// Set the player volume in localStorage if cookies are accepted
export function setVolume(volume: number): void {
	if (isCookiesAccepted()) {
		const v = Math.max(0, Math.min(1, volume));
		localStorage.setItem(VOLUME_KEY, String(v));
	}
}
