export const BASE_URL = 'http://192.168.1.15:5001/api/v1';

export const loginUser = async (phoneNumber, password) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password }),
    });
    return response.json();
};

export const registerUser = async (userData) => {
    const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...userData,
            userType: 'CITIZEN',
            role: 'CITIZEN',
        }),
    });
    return response.json();
};