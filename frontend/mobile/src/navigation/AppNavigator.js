import React, { useState } from 'react';
import AuthScreen from '../screens/AuthScreen';
import ExpressReportScreen from '../screens/ExpressReportScreen';
import DetailedReportScreen from '../screens/DetailedReportScreen';
import LiveMapScreen from '../screens/LiveMapScreen';

export default function AppNavigator() {
    const [userSession, setUserSession] = useState(null);
    const [activeScreen, setActiveScreen] = useState('express'); // 'express' | 'detailed' | 'liveMap'

    const handleLoginSuccess = (token, user) => {
        setUserSession({ token, user, isGuest: false });
    };

    const handleContinueAsGuest = () => {
        setUserSession({ token: null, user: null, isGuest: true });
    };

    const handleLogout = () => {
        setUserSession(null);
    };

    if (!userSession) {
        return (
            <AuthScreen
                onLoginSuccess={handleLoginSuccess}
                onContinueAsGuest={handleContinueAsGuest}
            />
        );
    }

    if (activeScreen === 'liveMap') {
        return <LiveMapScreen onBackToReport={() => setActiveScreen('express')} />;
    }

    if (activeScreen === 'detailed') {
        return (
            <DetailedReportScreen
                userSession={userSession}
                onBackToAuth={handleLogout}
                onSwitchToExpress={() => setActiveScreen('express')}
            />
        );
    }

    return (
        <ExpressReportScreen
            userSession={userSession}
            onBackToAuth={handleLogout}
            onSwitchToDetailed={() => setActiveScreen('detailed')}
            onOpenLiveMap={() => setActiveScreen('liveMap')}
        />
    );
}