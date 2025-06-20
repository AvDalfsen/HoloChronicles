import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-context';
import CharacterLayout from '@/layouts/characterLayout';
import Overview from '@/pages/character/overview';
import CharacterDetails from '@/pages/character/character-details';
import DutyObligation from '@/pages/character/duty-obligation';
import Species from '@/pages/character/species';
import Characteristics from '@/pages/character/characteristics';
import Skills from '@/pages/character/skills';
import Careers from '@/pages/character/careers';
import Specializations from '@/pages/character/specializations';
import Talents from '@/pages/character/talents';

export default function CharacterRouter() {
    return (
        <ThemeProvider>
            <Routes>
                <Route element={<CharacterLayout />}>
                    <Route index element={<Navigate to="species" replace />} />
                    <Route path="overview" element={<Overview />} />
                    <Route path="character-details" element={<CharacterDetails />} />
                    <Route path="duty-obligation" element={<DutyObligation />} />
                    <Route path="species" element={<Species />} />
                    <Route path="characteristics" element={<Characteristics />} />
                    <Route path="skills" element={<Skills />} />
                    <Route path="careers" element={<Careers />} />
                    <Route path="specializations" element={<Specializations />} />
                    <Route path="talents" element={<Talents />} />
                    {/* Add more character creation routes here */}
                </Route>
            </Routes>
        </ThemeProvider>
    );
}