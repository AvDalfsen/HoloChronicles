import TopBar from '@/components/character/topBar';
import Sidebar from '@/components/character/sideBar';
import { Outlet } from 'react-router-dom';

export default function CharacterLayout() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <TopBar />
            <div className="flex flex-1 mt-14"> {/* mt-14 = topbar height (3.5rem) */}
                <Sidebar />
                <main className="flex-1 p-4 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}