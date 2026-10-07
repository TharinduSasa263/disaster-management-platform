import React, { useState } from 'react';
import './App.css';
import OfficerLogin from './components/OfficerLogin';
import VerificationQueue from './components/VerificationQueue';

function App() {
    // null = not authenticated → show login screen
    const [session, setSession] = useState(null);

    const handleLoginSuccess = (token, user) => {
        setSession({ token, user });
    };

    const handleLogout = () => {
        setSession(null);
    };

    if (!session) {
        return <OfficerLogin onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="App">
            {/* Top nav bar with officer info & logout */}
            <div className="app-topbar">
                <span className="app-topbar-title">🛡️ DMC Verification Dashboard</span>
                <div className="app-topbar-right">
                    <span className="app-topbar-user">
                        {session.user?.fullName || session.user?.email || 'Officer'} &nbsp;·&nbsp;
                        <strong>{session.user?.role}</strong>
                    </span>
                    <button className="app-logout-btn" onClick={handleLogout}>
                        Sign Out
                    </button>
                </div>
            </div>

            <VerificationQueue officerToken={session.token} />
        </div>
    );
}

export default App;