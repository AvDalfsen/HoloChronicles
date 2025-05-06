export const login = async (username: string, password: string): Promise<{ success: boolean, message: string }> => {
    try {
        const response = await fetch('/api/authentication/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const text = await response.text();

        if (!response.ok) {
            return { success: false, message: text || 'Login failed' };
        }

        return { success: true, message: text || 'Login successful' };
    } catch (error) {
        console.error('Error during login:', error);
        return { success: false, message: 'Network error or server not reachable' };
    }
};


export const signup = async (username: string, password: string, email?: string): Promise<{ success: boolean, message: string }> => {
    try {
        const response = await fetch('/api/authentication/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, email }),
        });

        const text = await response.text();

        if (!response.ok) {
            return { success: false, message: text || 'Signup failed' };
        }

        return { success: true, message: text || 'Signup successful' };
    } catch (error) {
        console.error('Error during signup:', error);
        return { success: false, message: 'Network error or server not reachable' };
    }
};