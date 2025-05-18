import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
            <h1 className="text-3xl font-bold">HoloChronicles</h1>
            <div className="flex flex-col gap-2">
                <Link to="/character" className="text-blue-600 underline">Character Builder</Link>
                <Link to="/data" className="text-blue-600 underline">Data Browser</Link>
                <Link to="/gm" className="text-blue-600 underline">GM Tools</Link>
                <Link to="/editor" className="text-blue-600 underline">Data Editor</Link>
            </div>
        </main>
    );
}