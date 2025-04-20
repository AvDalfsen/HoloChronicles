import { createBrowserRouter, RouteObject } from 'react-router-dom';
import App from './App';
import Characteristics from './pages/Characteristics';
import Skills from './pages/Skills';

const routes: RouteObject[] = [
    {
        path: '/',      // This will be the root path
        element: <App />, // This is the layout component that will render the sidebar and topbar
        children: [
            { path: 'characteristics', element: <Characteristics /> },
            { path: 'skills', element: <Skills /> },
            // Additional routes can be added here later
        ],
    },
];

export const router = createBrowserRouter(routes); // This exports the router
