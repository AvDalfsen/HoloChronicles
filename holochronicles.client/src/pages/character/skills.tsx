import { useEffect, useState } from 'react';
import { fetchDataWithRetryAndCache } from '@/api/fetcher';
import { Skill } from '@/types/skill';
import * as diceIcons from '@/components/ui/diceIcons';
import { JSX } from 'react/jsx-runtime';
import { useCharacterStore } from '@/stores/characterStore';

const SKILLS_CACHE_KEY = 'skillsCache';
const SKILLS_API_KEY = '/api/skills';

function Skills() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { character, updateCharacter } = useCharacterStore();

    useEffect(() => {
        async function loadSkills() {
            const data = await fetchDataWithRetryAndCache<Skill[]>(
                SKILLS_API_KEY,
                SKILLS_CACHE_KEY
            );
            if (data) {
                setSkills(data);
            } else {
                setError('Failed to fetch skills');
            }
        }

        loadSkills();
    }, []);

    function displaySkillIcon(skillName: string, skillCharKey: string): JSX.Element {
        let charCount = 0;

        if (skillCharKey === 'BR') {
            charCount = character.characteristics.brawn.total;
        }

        return (
            <span style={{ display: 'flex' }}>
                {Array.from({ length: charCount }, (_, index) => (
                    <diceIcons.abilityIcon key={index} />
                ))}
            </span>
        );
    }



    return (
        <div>
            <h1>Skills</h1>
            <p>All them awesome skills, yo!</p>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {skills.length === 0 ? (
                <div>
                    <p><em>Loading skills...</em></p>
                    <div className="spinner" />
                </div>
            ) : (
                <table className="table table-striped" aria-labelledby="tableLabel">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>CharKey</th>
                        </tr>
                    </thead>
                    <tbody>
                        {skills.map(skill => (
                            <tr key={skill.name}>
                                <td>{skill.name}</td>
                                <td>{skill.charKey}</td>
                                <td>
                                    {displaySkillIcon(skill.name, skill.charKey)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Skills;
