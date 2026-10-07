import React, { useState } from 'react';
import './App.css';
import OfficerLogin from './components/OfficerLogin';
import VerificationQueue from './components/VerificationQueue';

function App() {
    // null = not authenticated → show login screen
    const [session, setSession] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('INCIDENT_VERIFICATION');

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
            {/* Top Navigation Header */}
            <header className="app-topbar">
                <div className="app-topbar-left">
                    <button
                        className="sidebar-toggle-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        title="Toggle Sidebar Navigation"
                    >
                        {sidebarOpen ? '◀' : '☰'}
                    </button>
                    <span className="app-topbar-title">🛡️ Disaster Management Command Center</span>
                </div>
                <div className="app-topbar-right">
                    <span className="app-topbar-user">
                        {session.user?.fullName || session.user?.email || 'Officer'} &nbsp;·&nbsp;
                        <strong>{session.user?.role}</strong>
                    </span>
                    <button className="app-logout-btn" onClick={handleLogout}>
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Layout Container: Sidebar Panel + Main Workspace */}
            <div className="app-layout">
                {/* Side Navigation Panel */}
                <aside className={`app-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                    <div className="sidebar-header">
                        <p className="sidebar-subtitle">DMC Operational Navigation</p>
                    </div>

                    <nav className="sidebar-nav">
                        <button
                            className={`nav-item ${activeTab === 'INCIDENT_VERIFICATION' ? 'active' : ''}`}
                            onClick={() => setActiveTab('INCIDENT_VERIFICATION')}
                        >
                            <span className="nav-icon">🛡️</span>
                            <span className="nav-text">Incident Verification</span>
                            <span className="nav-badge">LIVE</span>
                        </button>

                        <button
                            className={`nav-item ${activeTab === 'OPERATIONS_OVERVIEW' ? 'active' : ''}`}
                            onClick={() => setActiveTab('OPERATIONS_OVERVIEW')}
                        >
                            <span className="nav-icon">📊</span>
                            <span className="nav-text">Operations Overview</span>
                        </button>

                        <button
                            className={`nav-item ${activeTab === 'IOT_SENSORS' ? 'active' : ''}`}
                            onClick={() => setActiveTab('IOT_SENSORS')}
                        >
                            <span className="nav-icon">⚡</span>
                            <span className="nav-text">IoT Telemetry Sensors</span>
                        </button>

                        <button
                            className={`nav-item ${activeTab === 'DISASTER_MAP' ? 'active' : ''}`}
                            onClick={() => setActiveTab('DISASTER_MAP')}
                        >
                            <span className="nav-icon">🗺️</span>
                            <span className="nav-text">National GIS Hazard Map</span>
                        </button>
                    </nav>

                    <div className="sidebar-footer">
                        <p>DMC Platform v2.0</p>
                        <small>Connected to Backend Port 5001</small>
                    </div>
                </aside>

                {/* Main Content Workspace Area */}
                <main className="app-main-content">
                    {activeTab === 'INCIDENT_VERIFICATION' && (
                        <VerificationQueue officerToken={session.token} />
                    )}

                    {activeTab === 'OPERATIONS_OVERVIEW' && (
                        <div className="tab-placeholder-card">
                            <h2>📊 Operations Overview</h2>
                            <p>Real-time disaster metrics and active operational response teams overview.</p>
                            <button className="placeholder-switch-btn" onClick={() => setActiveTab('INCIDENT_VERIFICATION')}>
                                Open Incident Verification Queue →
                            </button>
                        </div>
                    )}

                    {activeTab === 'IOT_SENSORS' && (
                        <div className="tab-placeholder-card">
                            <h2>⚡ IoT Telemetry Sensors</h2>
                            <p>Real-time telemetry stream from river water gauges, rain gauges, and soil movement sensors.</p>
                            <button className="placeholder-switch-btn" onClick={() => setActiveTab('INCIDENT_VERIFICATION')}>
                                Open Incident Verification Queue →
                            </button>
                        </div>
                    )}

                    {activeTab === 'DISASTER_MAP' && (
                        <div className="tab-placeholder-card">
                            <h2>🗺️ National GIS Hazard Map</h2>
                            <p>Multi-layer spatial analysis map for emergency response units and district commanders.</p>
                            <button className="placeholder-switch-btn" onClick={() => setActiveTab('INCIDENT_VERIFICATION')}>
                                Open Incident Verification Queue →
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;