import './App.css';

import TopBar from './components/TopBar';
import Sidebar from './components/SideBar';
import { Outlet } from 'react-router-dom';
import React from 'react';

function App() {
    return (
        <div className="app-container">
            <TopBar />
            <div className="content-container">
                <Sidebar />
                <main className="main-content">
                    <Outlet /> {/* This is where page components like Characteristics or Skills will be rendered */}
                </main>
            </div>
        </div>
    );
}

export default App;
