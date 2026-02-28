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
