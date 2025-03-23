import { useEffect, useState } from 'react';
import './App.css';

function App() {
    const [characteristics, setCharacteristics] = useState();

    useEffect(() => {
        populateCharacteristics();
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

    return (
        <div>
            <h1>Characteristics</h1>
            <p>Them sweet Characteristics, baby!</p>
            {characteristicsContent}
        </div>
    );

    async function populateCharacteristics() {
        const response = await fetch('characteristics');
        if (response.ok) {
            const data = await response.json();
            setCharacteristics(data);
        }
    }
}

export default App;