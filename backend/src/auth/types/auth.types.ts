export interface LoginResponse {
  data: {
    message: string;
    role: string;
  };
}

export interface LogoutResponse {
  data: {
    message: string;
  };
}
