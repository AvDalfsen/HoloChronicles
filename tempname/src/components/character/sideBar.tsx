import { Link } from 'react-router-dom';

export default function Sidebar() {
    return (
        <aside className="w-52 bg-sidebar text-sidebar-foreground p-4 shadow-md h-full">
            <ul className="space-y-4">
                <li><Link to="/character/build/species" className="block hover:underline hover:text-sidebar-accent-foreground transition">Species</Link></li>
                <li><Link to="/character/build/characteristics" className="block hover:underline hover:text-sidebar-accent-foreground transition">Characteristics</Link></li>
                <li><Link to="/character/build/skills" className="block hover:underline hover:text-sidebar-accent-foreground transition">Skills</Link></li>
                <li><Link to="/character/build/careers" className="block hover:underline hover:text-sidebar-accent-foreground transition">Careers</Link></li>
                <li><Link to="/character/build/specializations" className="block hover:underline hover:text-sidebar-accent-foreground transition">Specializations</Link></li>
                <li><Link to="/character/build/talents" className="block hover:underline hover:text-sidebar-accent-foreground transition">Talents</Link></li>
            </ul>
        </aside>
    );
}

//TODO: make links conditional on character status
//import { Link } from 'react-router-dom';
//import { useCharacterStore } from '@/stores/characterStore';

//const { character } = useCharacterStore();
//export default function Sidebar() {
//    return (
//        <aside className="w-52 bg-sidebar text-sidebar-foreground p-4 shadow-md h-full">
//            <ul className="space-y-4">
//                <li><Link to="/character/build/species" className="block hover:underline hover:text-sidebar-accent-foreground transition">Species</Link></li>
//                <li><Link to="/character/build/characteristics" className="block hover:underline hover:text-sidebar-accent-foreground transition">Characteristics</Link></li>
//                <li><Link to="/character/build/skills" className="block hover:underline hover:text-sidebar-accent-foreground transition">Skills</Link></li>
//                <li><Link to="/character/build/careers" className="block hover:underline hover:text-sidebar-accent-foreground transition">Careers</Link></li>
//                {character?.career && (
//                    <li><Link to="/character/build/specializations" className="block hover:underline hover:text-sidebar-accent-foreground transition">Specializations</Link></li>
//                )}
//                <li><Link to="/character/build/talents" className="block hover:underline hover:text-sidebar-accent-foreground transition">Talents</Link></li>
//            </ul>
//        </aside>
//    );
//}