import { api } from './client';

export enum VaultItemType {
    Login = 0,
    Note = 1,
    CreditCard = 2,
    Identity = 3,
    Sftp = 4,
    Smtp = 5,
    ApiKey = 6,
    Database = 7,
    SshKey = 8,
    AppSecret = 9
}

export interface VaultItem {
    id: string; // Guid
    metaTitle: string;
    cipherText: string;
    type: VaultItemType;
    category: string; // Project Name
    createdAt: string;
}

export interface CreateVaultItemDto {
    name: string;
    encryptedValue: string; // JSON string of fields
    type: VaultItemType;
    category: string; // Project Name
}

export const getVaultItems = async () => {
    const response = await api.get<VaultItem[]>('/vault');
    return response.data;
};

export const createVaultItem = async (data: CreateVaultItemDto) => {
    const response = await api.post<VaultItem>('/vault', data);
    return response.data;
};

export const deleteVaultItem = async (id: string) => {
    await api.delete(`/vault/${id}`);
};
