export interface ReqResUser {
	id: number;
	email: string;
	first_name: string;
	last_name: string;
	avatar: string;
}

export interface ReqResUsersResponse {
	page: number;
	per_page: number;
	total: number;
	total_pages: number;
	data: ReqResUser[];
}

export interface SavedUser {
	id: number;
	email: string;
	first_name: string;
	last_name: string;
	avatar: string;
	role: "ADMIN" | "USER";
	saved_at: string;
}
