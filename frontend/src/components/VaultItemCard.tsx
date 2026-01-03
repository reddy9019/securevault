import type { VaultItem } from '../api/vault';
import { VaultItemType } from '../api/vault';
import { Trash2, Copy, Eye, EyeOff, Globe, Database, Key, Terminal, Server, FileText } from 'lucide-react';
import { useState } from 'react';

interface Props {
    item: VaultItem;
    onDelete: (id: string) => void;
}

export function VaultItemCard({ item, onDelete }: Props) {
    const [showSecret, setShowSecret] = useState(false);

    let data: any = {};
    try {
        data = JSON.parse(item.cipherText);
    } catch {
        data = { value: item.cipherText }; // Fallback
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const getIcon = () => {
        switch (item.type) {
            case VaultItemType.Login: return <Globe size={20} className="text-blue-400" />;
            case VaultItemType.Database: return <Database size={20} className="text-green-400" />;
            case VaultItemType.ApiKey: return <Key size={20} className="text-yellow-400" />;
            case VaultItemType.SshKey: return <Terminal size={20} className="text-purple-400" />;
            case VaultItemType.Sftp:
            case VaultItemType.Smtp: return <Server size={20} className="text-orange-400" />;
            case VaultItemType.Note: return <FileText size={20} className="text-gray-400" />;
            default: return <Key size={20} className="text-gray-400" />;
        }
    };

    const getTypeLabel = () => {
        switch (item.type) {
            case VaultItemType.Login: return 'Login';
            case VaultItemType.Database: return 'Database';
            case VaultItemType.ApiKey: return 'API Key';
            case VaultItemType.SshKey: return 'SSH Key';
            case VaultItemType.Sftp: return 'SFTP';
            case VaultItemType.Smtp: return 'SMTP';
            case VaultItemType.AppSecret: return 'App Secret';
            case VaultItemType.Note: return 'Note';
            default: return 'Secret';
        }
    };

    const renderDetails = () => {
        if (!showSecret) {
            return (
                <div className="mt-2 bg-gray-900 p-2 rounded flex items-center justify-between">
                    <span className="text-gray-500 italic text-sm">Click eye to reveal details</span>
                </div>
            );
        }

        return (
            <div className="mt-2 bg-gray-900 p-3 rounded space-y-2 text-sm max-h-48 overflow-y-auto">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase">{key}</span>
                        <div className="flex justify-between items-center group">
                            <code className="text-gray-300 break-all font-mono">
                                {String(value)}
                            </code>
                            <button
                                onClick={() => copyToClipboard(String(value))}
                                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-opacity ml-2"
                            >
                                <Copy size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors flex flex-col h-full">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-700/50 rounded-lg">
                        {getIcon()}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white leading-tight">{item.metaTitle}</h3>
                        <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded-full inline-block mt-1">
                            {getTypeLabel()}
                        </span>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => setShowSecret(!showSecret)}
                        className="text-gray-400 hover:text-blue-400 p-2 rounded hover:bg-gray-700/50 transition-colors"
                        title={showSecret ? "Hide Details" : "Show Details"}
                    >
                        {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                        onClick={() => onDelete(item.id)}
                        className="text-gray-400 hover:text-red-400 p-2 rounded hover:bg-gray-700/50 transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {renderDetails()}

            <div className="mt-auto pt-3 text-xs text-gray-600 flex justify-between">
                <span>Created {new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    );
}
