"use client";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

const ImpersonationContext = createContext(null);

const STORAGE_KEY = "grubpac_impersonation";

function loadPersistedState() {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (parsed?.clientId && parsed?.token && parsed?.expiresAt > Date.now()) {
			return parsed;
		}
		localStorage.removeItem(STORAGE_KEY);
		return null;
	} catch {
		return null;
	}
}

export function ImpersonationProvider({ children }) {
	const [impersonation, setImpersonation] = useState(null);

	useEffect(() => {
		const persisted = loadPersistedState();
		if (persisted) {
			setImpersonation(persisted);
		}
	}, []);

	const startImpersonation = useCallback((clientInfo, token) => {
		const state = {
			clientId: clientInfo.id,
			clientName: clientInfo.name,
			clientEmail: clientInfo.email,
			clientVertical: clientInfo.vertical,
			token,
			expiresAt: Date.now() + 25 * 60 * 1000,
		};
		setImpersonation(state);
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		} catch (_) {}
	}, []);

	const stopImpersonation = useCallback(() => {
		setImpersonation(null);
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch (_) {}
	}, []);

	const isImpersonating = !!impersonation;

	const value = {
		isImpersonating,
		impersonation,
		startImpersonation,
		stopImpersonation,
	};

	return (
		<ImpersonationContext.Provider value={value}>
			{children}
		</ImpersonationContext.Provider>
	);
}

export function useImpersonation() {
	const context = useContext(ImpersonationContext);
	if (!context) {
		throw new Error("useImpersonation must be used within an ImpersonationProvider");
	}
	return context;
}

export default ImpersonationContext;
