import { User, UserRole } from '../types';

// Mock API Delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
    login: async (email: string, password: string): Promise<User> => {
        await delay(800); // Simulate network
        // Mock Login Logic
        return {
            id: 'u-123',
            name: email.split('@')[0],
            email: email,
            role: UserRole.ADMIN,
            avatarUrl: undefined,
            status: 'Active',
            lastActive: 'Just now',
            plan: 'Pro',
            joinedDate: new Date().toLocaleDateString()
        };
    },

    logout: async (): Promise<void> => {
        await delay(200);
    },

    register: async (email: string): Promise<User> => {
        await delay(1000);
        return {
            id: `u-${Date.now()}`,
            name: email.split('@')[0],
            email: email,
            role: UserRole.VIEWER,
            status: 'Active',
            lastActive: 'Just now',
            plan: 'Free',
            joinedDate: new Date().toLocaleDateString()
        };
    },

    updateProfile: async (id: string, updates: Partial<User>): Promise<User> => {
        await delay(500);
        // In real app, this would PATCH /api/users/:id
        return {
            id,
            name: 'Updated User',
            email: 'user@example.com',
            role: UserRole.ADMIN,
            status: 'Active',
            lastActive: 'Now',
            ...updates
        };
    }
};
