export const login = async (username: string, password: string): Promise<boolean> => {
    try {
        const response = await fetch('/api/authentication/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            console.error('Login failed');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error during login:', error);
        return false;
    }
};

export const signup = async (username: string, password: string): Promise<boolean> => {
    try {
        const response = await fetch('/api/authentication/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            console.error('Signup failed');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error during signup:', error);
        return false;
    }
};