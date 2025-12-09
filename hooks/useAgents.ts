import { useState, useEffect, useCallback } from 'react';
import { Agent } from '../types';
import { agentService } from '../services/agentService';

export const useAgents = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAgents = useCallback(async () => {
        setLoading(true);
        try {
            const data = await agentService.getAll();
            setAgents(data);
        } catch (err) {
            setError('Failed to load agents');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial Load
    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    const saveAgent = useCallback(async (agent: Agent) => {
        try {
            const saved = await agentService.save(agent);
            setAgents(prev => {
                const exists = prev.find(a => a.id === saved.id);
                if (exists) return prev.map(a => a.id === saved.id ? saved : a);
                return [...prev, saved];
            });
            return saved;
        } catch (err) {
            setError('Failed to save agent');
            throw err;
        }
    }, []);

    const deleteAgent = useCallback(async (id: string) => {
        try {
            await agentService.delete(id);
            setAgents(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            setError('Failed to delete agent');
        }
    }, []);

    return {
        agents,
        loading,
        error,
        saveAgent,
        deleteAgent,
        refreshAgents: fetchAgents
    };
};
