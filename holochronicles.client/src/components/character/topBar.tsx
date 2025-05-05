import { useTheme } from '@/components/ui/theme-context';
import { Sun, Moon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { login, signup } from '@/api/authentication';

const TopBar = () => {
    const { theme, toggleTheme } = useTheme();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [isSignup, setIsSignup] = useState(false);

    const handleSubmit = async () => {
        if (isSignup) {
            const success = await signup(username, password);
            if (success) {
                setModalOpen(false);
                // optionally clear fields or set logged-in state
            }
        } else {
            const success = await login(username, password);
            if (success) {
                setModalOpen(false);
            }
        }
    };

    return (
        <>
            <header className="fixed top-0 left-0 w-full h-14 bg-primary text-primary-foreground flex items-center justify-between px-4 z-50 shadow">
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-lg font-semibold tracking-wide hover:underline">
                        HoloChronicles
                    </Link>
                    <nav className="flex gap-4 text-sm">
                        <Link to="/character" className="hover:underline">Character</Link>
                        <Link to="/gm" className="hover:underline">GM</Link>
                        <Link to="/data" className="hover:underline">Data</Link>
                        <Link to="/editor" className="hover:underline">Editor</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setModalOpen(true); setIsSignup(false); }}
                        className="px-3 py-1 rounded bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => { setModalOpen(true); setIsSignup(true); }}
                        className="px-3 py-1 rounded bg-accent text-accent-foreground text-sm hover:bg-accent/80 transition"
                    >
                        Sign Up
                    </button>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-md hover:bg-primary/80 transition"
                        aria-label="Toggle dark mode"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </header>

            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-background text-foreground p-6 rounded-lg shadow-lg w-80 relative">
                        <button
                            onClick={() => setModalOpen(false)}
                            className="absolute top-2 right-2 p-1 rounded hover:bg-secondary/20"
                        >
                            <X size={16} />
                        </button>
                        <h2 className="text-xl font-semibold mb-4">
                            {isSignup ? 'Sign Up' : 'Login'}
                        </h2>
                        <div className="flex flex-col gap-3">
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="px-3 py-2 rounded border border-border bg-background text-foreground text-sm"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="px-3 py-2 rounded border border-border bg-background text-foreground text-sm"
                            />
                            <button
                                onClick={handleSubmit}
                                className="mt-2 px-4 py-2 rounded bg-primary text-primary-foreground text-sm hover:bg-primary/80 transition"
                            >
                                {isSignup ? 'Register' : 'Login'}
                            </button>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            {isSignup ? (
                                <>
                                    Already have an account?{' '}
                                    <button
                                        onClick={() => setIsSignup(false)}
                                        className="text-accent hover:underline"
                                    >
                                        Login
                                    </button>
                                </>
                            ) : (
                                <>
                                    New here?{' '}
                                    <button
                                        onClick={() => setIsSignup(true)}
                                        className="text-accent hover:underline"
                                    >
                                        Sign Up
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TopBar;