import { useTheme } from '@/components/ui/theme-context';
import { Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

const TopBar = () => {
    const { theme, toggleTheme } = useTheme();

    return (
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
            <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-primary/80 transition"
                aria-label="Toggle dark mode"
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
        </header>
    );
};

export default TopBar;