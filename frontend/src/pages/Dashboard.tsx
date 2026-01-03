import { useEffect, useState } from 'react';
import { getVaultItems, createVaultItem, deleteVaultItem, VaultItemType } from '../api/vault';
import type { VaultItem } from '../api/vault';
import { VaultItemCard } from '../components/VaultItemCard';
import { Plus, LogOut, Folder } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
    const [items, setItems] = useState<VaultItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [newItemName, setNewItemName] = useState('');
    const [newProjectName, setNewProjectName] = useState('General'); // Project
    const [selectedType, setSelectedType] = useState<VaultItemType>(VaultItemType.Login);
    const [formFields, setFormFields] = useState<Record<string, string>>({});

    const navigate = useNavigate();

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            const data = await getVaultItems();
            setItems(data);
        } catch (error) {
            console.error('Failed to load items', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (key: string, value: string) => {
        setFormFields(prev => ({ ...prev, [key]: value }));
    };

    const renderDynamicFields = () => {
        switch (selectedType) {
            case VaultItemType.Login:
                return (
                    <>
                        <input type="text" placeholder="Username" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2" onChange={e => handleFieldChange('username', e.target.value)} />
                        <input type="password" placeholder="Password" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2" onChange={e => handleFieldChange('password', e.target.value)} />
                        <input type="url" placeholder="Website URL" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" onChange={e => handleFieldChange('url', e.target.value)} />
                    </>
                );
            case VaultItemType.Note:
                return (
                    <>
                        <input type="text" placeholder="Title" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2" onChange={e => handleFieldChange('title', e.target.value)} />
                        <textarea placeholder="Body" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white h-24" onChange={e => handleFieldChange('body', e.target.value)} />
                    </>
                );
            case VaultItemType.Database:
                return (
                    <>
                        <input type="text" placeholder="Host (e.g. localhost)" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2" onChange={e => handleFieldChange('host', e.target.value)} />
                        <input type="text" placeholder="Port (e.g. 5432)" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2" onChange={e => handleFieldChange('port', e.target.value)} />
                        <input type="text" placeholder="Username" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2" onChange={e => handleFieldChange('username', e.target.value)} />
                        <input type="password" placeholder="Password" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2" onChange={e => handleFieldChange('password', e.target.value)} />
                        <select className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" onChange={e => handleFieldChange('driver', e.target.value)}>
                            <option value="postgres">PostgreSQL</option>
                            <option value="mysql">MySQL</option>
                            <option value="sqlserver">SQL Server</option>
                            <option value="mongo">MongoDB</option>
                        </select>
                    </>
                );
            case VaultItemType.Sftp:
                return (
                    <>
                        <input type="text" placeholder="Host" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2" onChange={e => handleFieldChange('host', e.target.value)} />
                        <input type="text" placeholder="Port (e.g. 21/22)" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2" onChange={e => handleFieldChange('port', e.target.value)} />
                        <input type="text" placeholder="Username" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2" onChange={e => handleFieldChange('username', e.target.value)} />
                        <input type="password" placeholder="Password" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2" onChange={e => handleFieldChange('password', e.target.value)} />
                        <textarea placeholder="Private Key (PEM/OpenSSH)" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono h-24" onChange={e => handleFieldChange('privateKey', e.target.value)} />
                    </>
                );
            case VaultItemType.Smtp:
                return (
                    <>
                        <input type="text" placeholder="Host" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2" onChange={e => handleFieldChange('host', e.target.value)} />
                        <input type="text" placeholder="Port" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2" onChange={e => handleFieldChange('port', e.target.value)} />
                        <input type="text" placeholder="Username" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2" onChange={e => handleFieldChange('username', e.target.value)} />
                        <input type="password" placeholder="Password" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2" onChange={e => handleFieldChange('password', e.target.value)} />
                        <label className="flex items-center text-white"><input type="checkbox" className="mr-2" onChange={e => handleFieldChange('useTls', e.target.checked.toString())} /> Use TLS</label>
                    </>
                );
            case VaultItemType.ApiKey:
                return (
                    <>
                        <input type="text" placeholder="Service Name" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2" onChange={e => handleFieldChange('service', e.target.value)} />
                        <input type="text" placeholder="API Key / Token" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2 font-mono" onChange={e => handleFieldChange('key', e.target.value)} />
                        <input type="text" placeholder="Note" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" onChange={e => handleFieldChange('note', e.target.value)} />
                    </>
                );
            case VaultItemType.SshKey:
                return (
                    <>
                        <input type="text" placeholder="Host" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2" onChange={e => handleFieldChange('host', e.target.value)} />
                        <input type="text" placeholder="Username" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2" onChange={e => handleFieldChange('username', e.target.value)} />
                        <textarea placeholder="Private Key (PEM/OpenSSH)" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono h-24 mb-2" onChange={e => handleFieldChange('privateKey', e.target.value)} />
                        <input type="text" placeholder="Note" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" onChange={e => handleFieldChange('note', e.target.value)} />
                    </>
                );
            case VaultItemType.AppSecret:
                return (
                    <>
                        <input type="text" placeholder="Client ID" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2" onChange={e => handleFieldChange('clientId', e.target.value)} />
                        <input type="text" placeholder="Client Secret" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2 font-mono" onChange={e => handleFieldChange('clientSecret', e.target.value)} />
                        <input type="text" placeholder="Redirect URI" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" onChange={e => handleFieldChange('redirectUri', e.target.value)} />
                    </>
                );
            default:
                return <div className="text-gray-500">Form not implemented for this type yet.</div>;
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const encryptedValue = JSON.stringify(formFields);

            await createVaultItem({
                name: newItemName,
                encryptedValue: encryptedValue,
                type: selectedType,
                category: newProjectName
            });

            setNewItemName('');
            setFormFields({});
            setIsCreating(false);
            loadItems();
        } catch (error) {
            console.error('Failed to create item', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await deleteVaultItem(id);
            setItems(items.filter(i => i.id !== id));
        } catch (error) {
            console.error('Failed to delete item', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Group items by Project (Category)
    const groupedItems = items.reduce((acc, item) => {
        const project = item.category || 'General';
        if (!acc[project]) acc[project] = [];
        acc[project].push(item);
        return acc;
    }, {} as Record<string, VaultItem[]>);

    if (loading) return <div className="text-white p-8 text-center">Loading vault...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <header className="max-w-4xl mx-auto flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    SecureVault
                </h1>
                <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <LogOut size={20} /> Logout
                </button>
            </header>

            <main className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">My Secrets</h2>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} /> Add Secret
                    </button>
                </div>

                {isCreating && (
                    <form onSubmit={handleCreate} className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700 animate-fade-in shadow-xl">
                        <h3 className="text-lg font-medium mb-4">Add New Secret</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Project Name</label>
                                <input
                                    type="text"
                                    value={newProjectName}
                                    onChange={e => setNewProjectName(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                                    placeholder="Project Name (e.g. E-Commerce App)"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Secret Type</label>
                                <select
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                                    value={selectedType}
                                    onChange={e => {
                                        setSelectedType(Number(e.target.value));
                                        setFormFields({}); // Clear fields on type change
                                    }}
                                >
                                    <option value={VaultItemType.Login}>Website Login</option>
                                    <option value={VaultItemType.Note}>Secure Note</option>
                                    <option value={VaultItemType.Database}>Database</option>
                                    <option value={VaultItemType.Sftp}>FTP/SFTP</option>
                                    <option value={VaultItemType.Smtp}>SMTP Server</option>
                                    <option value={VaultItemType.ApiKey}>API Key</option>
                                    <option value={VaultItemType.SshKey}>SSH Key</option>
                                    <option value={VaultItemType.AppSecret}>App Secret (OAuth)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Name / Reference</label>
                                <input
                                    type="text"
                                    value={newItemName}
                                    onChange={e => setNewItemName(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                                    placeholder="Reference Name (e.g. Prod Database)"
                                    required
                                />
                            </div>

                            <div className="border-t border-gray-700 pt-4 mt-4">
                                <label className="block text-sm text-gray-400 mb-2">Details</label>
                                {renderDynamicFields()}
                            </div>

                            <div className="flex gap-3 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors"
                                >
                                    Save Secret
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {Object.keys(groupedItems).length === 0 ? (
                    <div className="text-center text-gray-500 py-12 bg-gray-800/50 rounded-lg dashed-border">
                        <p>No secrets found. Add one to get started!</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedItems).map(([project, projectItems]) => (
                            <div key={project}>
                                <div className="flex items-center gap-2 mb-4 text-blue-400 border-b border-gray-800 pb-2">
                                    <Folder size={20} />
                                    <h3 className="text-xl font-semibold">{project}</h3>
                                    <span className="text-sm text-gray-500 bg-gray-800 px-2 rounded-full">{projectItems.length}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {projectItems.map(item => (
                                        <VaultItemCard key={item.id} item={item} onDelete={handleDelete} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
