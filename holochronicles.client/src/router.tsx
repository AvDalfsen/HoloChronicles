import { createBrowserRouter, RouteObject } from 'react-router-dom';
import App from './App';
import Characteristics from './pages/Characteristics';
import Skills from './pages/Skills';
import { ThemeProvider } from '@/components/ui/theme-context'; // adjust if needed

const routes: RouteObject[] = [
    {
        path: '/',
        element: (
            <ThemeProvider>
                <App />
            </ThemeProvider>
        ),
        children: [
            { path: 'characteristics', element: <Characteristics /> },
            { path: 'skills', element: <Skills /> },
            // Add more routes here as needed
        ],
    },
];

export const router = createBrowserRouter(routes);
