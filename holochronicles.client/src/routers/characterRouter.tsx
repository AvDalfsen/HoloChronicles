import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-context';
import CharacterLayout from '@/layouts/characterLayout';
import Species from '@/pages/character/species';
import Characteristics from '@/pages/character/characteristics';
import Skills from '@/pages/character/skills';
import Careers from '@/pages/character/careers';

export default function CharacterRouter() {
    return (
        <ThemeProvider>
            <Routes>
                <Route element={<CharacterLayout />}>
                    <Route index element={<Navigate to="characteristics" replace />} />
                    <Route path="species" element={<Species />} />
                    <Route path="characteristics" element={<Characteristics />} />
                    <Route path="skills" element={<Skills />} />
                    <Route path="careers" element={<Careers />} />
                    {/* Add more character creation routes here */}
                </Route>
            </Routes>
        </ThemeProvider>
    );
}