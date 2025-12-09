import { useState, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const userData = await authService.login(email, password);
            setUser(userData);
            return userData;
        } catch (err) {
            setError('Failed to login. Please try again.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        await authService.logout();
        setUser(null);
    }, []);

    const updateUser = useCallback(async (updates: Partial<User>) => {
        if (!user) return;
        try {
            const updated = await authService.updateProfile(user.id, updates);
            setUser(updated);
        } catch (err) {
            setError('Failed to update profile');
        }
    }, [user]);

    return {
        user,
        loading,
        error,
        login,
        logout,
        updateUser
    };
};
