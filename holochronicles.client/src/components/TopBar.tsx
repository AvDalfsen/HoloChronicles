import { useTheme } from '@/components/ui/theme-context';
import { Sun, Moon } from 'lucide-react';

const TopBar = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="fixed top-0 left-0 w-full h-14 bg-primary text-primary-foreground flex items-center justify-between px-4 z-50 shadow">
            <h1 className="text-lg font-semibold tracking-wide">HoloChronicles</h1>
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
