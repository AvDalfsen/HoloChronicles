import './index.css';

import TopBar from './components/TopBar';
import Sidebar from './components/SideBar';
import { Outlet } from 'react-router-dom';

function App() {
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

export default App;
