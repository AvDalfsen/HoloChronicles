import { Routes, Route } from 'react-router-dom';
import Landing from '@/pages/mainLanding';
import CharacterLanding from '@/pages/characterLanding';
//import DataLanding from '@/pages/dataLanding';
//import GMLanding from '@/pages/gmLanding';
//import EditorLanding from '@/pages/editorLanding';

import CharacterRouter from './routers/characterRouter';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/character/*" element={<CharacterLanding />} />
            {/*<Route path="/data/*" element={<DataLanding />} />*/}
            {/*<Route path="/gm/*" element={<GMLanding />} />*/}
            {/*<Route path="/editor/*" element={<EditorLanding />} />*/}

            {/* Nested route that kicks in once you go into actual character creation */}
            <Route path="/character/build/*" element={<CharacterRouter />} />
        </Routes>
    );
}