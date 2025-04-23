import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '@/stores/characterStore';
import { useState } from 'react';

export default function CharacterLanding() {
    const navigate = useNavigate();
    const storedCharacter = useCharacterStore((state) => state.character);
    const updateCharacter = useCharacterStore((state) => state.updateCharacter);
    const [showConfirm, setShowConfirm] = useState(false);

    const hasStoredCharacter = storedCharacter?.name?.trim() !== ''; // crude check for presence

    const handleNewCharacter = () => {
        if (hasStoredCharacter) {
            setShowConfirm(true);
        } else {
            createNewCharacter();
        }
    };

    const createNewCharacter = () => {
        const newCharacter = {
            ...storedCharacter,
            name: 'New Character',  // Or any other initial data you want to assign
        };

        updateCharacter(newCharacter); // Update the store with the new character
        navigate('/character/build');
    };

    const handleConfirmOverwrite = () => {
        createNewCharacter();
        setShowConfirm(false);
    };

    const handleCancelOverwrite = () => {
        setShowConfirm(false);
    };

    const handleContinue = () => {
        if (hasStoredCharacter) {
            navigate('/character/build');
        }
    };

    const dummyHasDBCharacters = false;
    const handleLoadFromDB = () => {
        if (dummyHasDBCharacters) {
            // future implementation
        } else {
            alert('Database loading coming soon!');
        }
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
            <h2 className="text-2xl font-bold">Character Builder</h2>

            <button className="btn" onClick={handleNewCharacter}>
                Create New Character
            </button>

            <button
                className={`btn ${!hasStoredCharacter ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleContinue}
                disabled={!hasStoredCharacter}
            >
                Continue Current Character
            </button>

            <button
                className="btn opacity-50 cursor-not-allowed"
                onClick={handleLoadFromDB}
                disabled={!dummyHasDBCharacters}
            >
                Load From Database
            </button>

            {showConfirm && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-transparent z-50"
                    onClick={handleCancelOverwrite} // Clicking anywhere outside the box triggers cancel
                >
                    <div
                        className="bg-background p-6 rounded shadow-md text-center max-w-sm w-full"
                        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the box from closing it
                    >
                        <h3 className="text-lg font-semibold mb-4">Overwrite Existing Character?</h3>
                        <p className="mb-6 text-sm text-muted-foreground">
                            You already have a character saved in local storage. Do you wish to overwrite it?
                        </p>
                        <div className="flex justify-center gap-4">
                            <button className="btn" onClick={handleConfirmOverwrite}>Yes, overwrite</button>
                            <button className="btn btn-outline" onClick={handleCancelOverwrite}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}