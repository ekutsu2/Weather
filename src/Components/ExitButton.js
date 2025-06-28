import React from 'react';
import './ExitButton.css';
import WGJLogo from '../Assets/images/WGJLogo.png'; 

function ExitButton({ onExit }) {
    return (
        <img 
            src={WGJLogo} 
            alt="Home" 
            className="exit-logo" 
            onClick={onExit} 
        />
    );
}

export default ExitButton;