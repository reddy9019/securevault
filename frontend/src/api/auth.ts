import { api } from './client';

export interface PreLoginRequest {
    email: string;
}

export interface PreLoginResponse {
    authSalt: string;
    keySalt: string;
}

export interface RegisterRequest {
    email: string;
    authHash: string;
    authSalt: string;
    keySalt: string;
    encryptedMasterKey: string;
    encryptedMasterKeyIV: string;
    recoveryKeyHash: string;
}

export interface LoginRequest {
    email: string;
    authHash: string;
    mfaToken?: string;
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    userId: string;
    email: string;
    keySalt: string;
    encryptedMasterKey: string;
    encryptedMasterKeyIV: string;
}

export const authApi = {
    preLogin: async (data: PreLoginRequest) => {
        const res = await api.post<PreLoginResponse>('/auth/prelogin', data);
        return res.data;
    },

    register: async (data: RegisterRequest) => {
        const res = await api.post<AuthResponse>('/auth/register', data);
        return res.data;
    },

    login: async (data: LoginRequest) => {
        const res = await api.post<AuthResponse>('/auth/login', data);
        return res.data;
    }
};
