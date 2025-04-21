import { Link } from 'react-router-dom';
import React from 'react';

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