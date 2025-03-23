import { useEffect, useState } from 'react';
import './App.css';

function App() {
    const [characteristics, setCharacteristics] = useState();
    const [skills, setSkills] = useState();

    useEffect(() => {
        populateCharacteristics();
        populateSkills();
    }, []);

    const characteristicsContent = characteristics === undefined
        ? <p><em>Loading characteristics...</em></p>
        : <table className="table table-striped" aria-labelledby="tableLabel">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                {characteristics.map(characteristic =>
                    <tr key={characteristic.name}>
                        <td>{characteristic.name}</td>
                        <td>{characteristic.description}</td>
                    </tr>
                )}
            </tbody>
        </table>;

    const skillsContent = skills === undefined
        ? <p><em>Loading skills...</em></p>
        : <table className="table table-striped" aria-labelledby="tableLabel">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>CharKey</th>
                </tr>
            </thead>
            <tbody>
                {skills.map(skill =>
                    <tr key={skill.name}>
                        <td>{skill.name}</td>
                        <td>{skill.charKey}</td>
                    </tr>
                )}
            </tbody>
        </table>;

    return (
        <div>
            <h1>Characteristics</h1>
            <p>Them sweet Characteristics, baby!</p>
            {characteristicsContent}

            <h1>Skills</h1>
            <p>All them awesome skills, yo!</p>
            {skillsContent}
        </div>
    );

    async function populateCharacteristics() {
        const response = await fetch('characteristics');
        if (response.ok) {
            const data = await response.json();
            setCharacteristics(data);
        }
    }

    async function populateSkills() {
        const response = await fetch('skills');
        if (response.ok) {
            const data = await response.json();
            setSkills(data);
        }
    }
}

export default App;