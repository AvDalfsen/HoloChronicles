import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '@/stores/characterStore';
import { defaultCharacter } from '@/types/defaultCharacter';
import { Species } from '@/types/species';
import {
    useCachedData,
    SPECIES_API_KEY, SPECIES_CACHE_KEY,
} from '@/pages/utils/fetcher'

export default function CharacterLanding() {
    const navigate = useNavigate();
    const storedCharacter = useCharacterStore((state) => state.character);
    const updateCharacter = useCharacterStore((state) => state.updateCharacter);
    const [showConfirm, setShowConfirm] = useState(false);

    const hasStoredCharacter = storedCharacter?.name?.trim() !== ''; // crude check for presence

    const { data: species, loading: loadingSpecies, error: errorSpecies } =
        useCachedData<Species[]>(SPECIES_API_KEY, SPECIES_CACHE_KEY);

    if (loadingSpecies) {
        return <p>Loading…</p>;
    }

    if (errorSpecies) {
        return (
            <p className="text-red-500">
                {errorSpecies}
            </p>
        );
    }

    if (!species) {
        return <p className="text-red-500">Data missing.</p>;
    }

    const handleNewCharacter = () => {
        if (hasStoredCharacter) {
            setShowConfirm(true);
        } else {
            createNewCharacter();
        }
    };

    const createNewCharacter = () => {
        const newCharacter = {
            ...defaultCharacter, // Just some default information to get going. Mostly just defaults to Human with the relevant stats.
            name: 'New Character',
        };

        updateCharacter(newCharacter);
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