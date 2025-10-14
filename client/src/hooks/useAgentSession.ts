import { useState } from 'react';

export function useAgentSession() {
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [creating, setCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const create = async (sessionType: string, initialContext?: any) => {
		setCreating(true);
		setError(null);
		try {
			const res = await fetch('/api/agent/session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ sessionType, initialContext })
			});
			if (!res.ok) throw new Error('Failed to create session');
			const data = await res.json();
			setSessionId(data.sessionId);
			return data.sessionId as string;
		} catch (e: any) {
			setError(e.message || 'Failed to create session');
			throw e;
		} finally {
			setCreating(false);
		}
	};

	return { sessionId, creating, error, create };
}


