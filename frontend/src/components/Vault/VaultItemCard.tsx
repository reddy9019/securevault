import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Trash2, Globe, FileText, Key as KeyIcon, Server, Mail } from 'lucide-react';
import { Button } from '../Button';
import { VaultItemDto, VaultItemType } from '../../api/vault';
import { decryptData, unwrapKey } from '../../lib/crypto';
import clsx from 'clsx';

interface VaultItemCardProps {
    item: VaultItemDto;
    onDelete: (id: string) => void;
}

export const VaultItemCard: React.FC<VaultItemCardProps> = ({ item, onDelete }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [decryptedSecret, setDecryptedSecret] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const getIcon = (type: VaultItemType) => {
        switch (type) {
            case VaultItemType.Login: return <Globe className="w-6 h-6 text-blue-400" />;
            case VaultItemType.Note: return <FileText className="w-6 h-6 text-yellow-400" />;
            case VaultItemType.ApiKey: return <KeyIcon className="w-6 h-6 text-green-400" />;
            case VaultItemType.Sftp: return <Server className="w-6 h-6 text-purple-400" />;
            case VaultItemType.Smtp: return <Mail className="w-6 h-6 text-red-400" />;
            default: return <FileText className="w-6 h-6 text-slate-400" />;
        }
    };

    const handleReveal = async () => {
        if (isRevealed) {
            setIsRevealed(false);
            setDecryptedSecret('');
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            const vaultKeyJson = sessionStorage.getItem('vaultKey');
            if (!vaultKeyJson) throw new Error("Vault is locked. Please login again.");

            const masterKey = await window.crypto.subtle.importKey(
                'jwk',
                JSON.parse(vaultKeyJson),
                { name: 'AES-GCM' },
                false,
                ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
            );

            // 1. Unwrap Item Key using Master Key
            // Note: In real app, we might optimize by caching unwrapped item keys in memory
            const itemKey = await unwrapKey(item.encryptedItemKey, item.iv, masterKey);
            // Wait, item.iv is usually for the payload?
            // Check implementation_plan:
            // Encrypt each item’s payload ... using the Item Key.
            // Encrypt the Item Key using the Master Key.
            // We need IV for EACH encryption.
            // My entity has ONE VI: `public string IV`. Is that for Payload or ItemKey?
            // Entity has `item_key_iv` column in DB description in User prompt?
            // Prompt: "VaultItems: ... cipher_blob, cipher_iv, encrypted_item_key, item_key_iv."
            // My Entity `VaultItem.cs` has: `CipherText`, `IV`, `EncryptedItemKey`.
            // I MISSING `EncryptedItemKeyIV` in `VaultItem.cs`.
            // I used `IV` for Payload. I need another IV for the Key wrapping.
            // OR `wrapKey` mechanism in WebCrypto handles IV? 
            // `wrapKey` with AES-GCM requires an IV. It returns it?
            // My `wrapKey` function returns `{ encryptedKey, iv }`.
            // I need to store that IV.

            // Let's check `VaultItem.cs` again.
            // I need to fix the backend entity if I missed `ItemKeyIV`.
            // I will assume I need to fix it.

            // For now, I will assume I can't reveal until I fix the backend.
            // OR I re-used the same IV? Re-using IV with same Key is catastrophic.
            // But here:
            // Payload encrypted with ItemKey + IV1.
            // ItemKey encrypted with MasterKey + IV2.
            // Different Keys, so technically different IV namespaces, but still need to store IV2.

            // I'll add `ItemKeyIV` to `VaultItem` entity in the next backend step.
            // Constructing logic assuming it exists or I pass it.

            throw new Error("Implementation pending: Schema update required for ItemKeyIV");

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to decrypt");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 shadow-md flex flex-col gap-3">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-700 rounded-lg">
                        {getIcon(item.type)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">{item.metaTitle}</h3>
                        <p className="text-sm text-slate-400">{item.type.toString()}</p>
                        {item.metaUsername && <p className="text-xs text-slate-500 font-mono mt-1">{item.metaUsername}</p>}
                    </div>
                </div>
                <button onClick={() => onDelete(item.id)} className="text-slate-500 hover:text-red-400">
                    <Trash2 size={18} />
                </button>
            </div>

            {error && <div className="text-red-500 text-xs bg-red-900/20 p-2 rounded">{error}</div>}

            <div className="mt-2">
                {isRevealed ? (
                    <div className="p-3 bg-slate-900 rounded border border-slate-600 font-mono text-sm break-all relative group">
                        {decryptedSecret}
                        <button
                            onClick={() => navigator.clipboard.writeText(decryptedSecret)}
                            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy"
                        >
                            <Copy size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="h-10 bg-slate-900 rounded border border-slate-700 flex items-center justify-center text-slate-600 text-sm select-none">
                        ••••••••••••••••
                    </div>
                )}
            </div>

            <Button variant="secondary" onClick={handleReveal} isLoading={isLoading} className="text-xs py-2">
                {isRevealed ? <><EyeOff size={14} className="mr-2 inline" /> Hide Secret</> : <><Eye size={14} className="mr-2 inline" /> Reveal Secret</>}
            </Button>
        </div>
    );
};
