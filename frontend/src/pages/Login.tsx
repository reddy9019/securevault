import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { deriveAuthHash, deriveMasterKey, unwrapKey } from '../lib/crypto';
import axios from 'axios';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // 1. Pre-login: Get Salts
            const salts = await authApi.preLogin({ email });

            // 2. Derive Keys
            const authHash = await deriveAuthHash(password, salts.authSalt);
            const kek = await deriveMasterKey(password, salts.keySalt);

            // 3. Login
            const res = await authApi.login({
                email,
                authHash,
            });

            // 4. Decrypt Master Key
            // The server returns EncryptedMasterKey (which is the Result of wrapKey(RMK, KEK))
            // We unwrap it using our derived KEK.
            // If password is wrong, unwrapKey will likely fail (AEAD tag mismatch).
            try {
                if (!res.encryptedMasterKey || !res.encryptedMasterKeyIV) {
                    throw new Error("Server returned invalid key data");
                }

                const masterKey = await unwrapKey(res.encryptedMasterKey, res.encryptedMasterKeyIV, kek);

                // Store session data
                localStorage.setItem('token', res.token);
                // We CANNOT store the MasterKey in localStorage (security risk).
                // It should be kept in memory context. 
                // For MVP, we'll assume a global context or pass it via state.
                // Let's use sessionStorage for now as a "better than localStorage" option, 
                // but ideally we'd use a React Context that clears on refresh.
                // Wait, CryptoKey is not serializable. We can't put it in storage easily without exporting.
                // If we export it, we risk exposure.
                // Plan: Export to JWK or Raw, store in SessionStorage, re-import on page load.
                // Not perfectly zero-knowledge (XSS risk), but standard for web apps.

                const exportedKey = await window.crypto.subtle.exportKey('jwk', masterKey);
                sessionStorage.setItem('vaultKey', JSON.stringify(exportedKey));

                navigate('/dashboard');
            } catch (cryptoError) {
                console.error(cryptoError);
                setError('Failed to decrypt vault. Wrong password?');
                setIsLoading(false);
                return;
            }

        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Login failed');
            } else {
                setError('An unexpected error occurred');
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
            <div className="w-full max-w-md rounded-lg bg-slate-800 p-8 shadow-xl border border-slate-700">
                <h2 className="mb-6 text-center text-3xl font-bold text-white">Unlock Vault</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        label="Master Password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <Button type="submit" isLoading={isLoading}>
                        Unlock
                    </Button>

                    <p className="text-center text-sm text-slate-400">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-400 hover:text-blue-300">
                            Sign up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};
