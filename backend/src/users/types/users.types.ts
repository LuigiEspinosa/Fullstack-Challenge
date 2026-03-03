import { Role } from '@prisma/client';

export interface UpsertUserInput {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

// Single user response
export interface UpsertUserResponse {
  data: UpsertUserInput & {
    role: Role;
    saved_at: Date;
  };
}

// Multiple users response
export interface GetSavedUsersResponse {
  data: UpsertUserInput &
    {
      role: Role;
      saved_at: Date;
    }[];
}

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
