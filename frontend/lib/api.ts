const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
	const res = await fetch(`${API_URL}${path}`, {
		...init,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...init.headers,
		},
	});

	if (!res.ok) {
		const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
		throw new Error(body?.error?.message ?? "Something went wrong.");
	}

	return res.json() as Promise<T>;
}

export async function login(email: string, password: string) {
	return apiFetch<{ data: { message: string; role: string } }>("/auth/login", {
		method: "POST",
		body: JSON.stringify({ email, password }),
	});
}

export async function logout() {
	return apiFetch<{ data: { message: string } }>("/auth/logout", {
		method: "POST",
	});
}
