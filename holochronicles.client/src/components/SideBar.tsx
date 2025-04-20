import { Link } from 'react-router-dom';

export default function Sidebar() {
    return (
        <div className="sidebar">
            <ul>
                <li><Link to="/characteristics">Characteristics</Link></li>
                <li><Link to="/skills">Skills</Link></li>
            </ul>
        </div>
    );
}