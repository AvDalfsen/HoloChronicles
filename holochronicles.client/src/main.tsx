import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import { router } from './router'; 
import React from 'react';

const rootElement = document.getElementById('root');
if (rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <RouterProvider router={router} /> {/* Use RouterProvider to apply the routes */}
        </StrictMode>
    );
} else {
    throw new Error("Root element not found");
}
