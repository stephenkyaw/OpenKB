import { Agent } from '../types';
import { MOCK_AGENTS } from '../constants';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory store for dev (persists during session)
let agentsStore = [...MOCK_AGENTS];

export const agentService = {
    getAll: async (): Promise<Agent[]> => {
        await delay(400);
        return [...agentsStore];
    },

    getById: async (id: string): Promise<Agent | undefined> => {
        await delay(200);
        return agentsStore.find(a => a.id === id);
    },

    save: async (agent: Agent): Promise<Agent> => {
        await delay(600);
        const index = agentsStore.findIndex(a => a.id === agent.id);
        if (index >= 0) {
            agentsStore[index] = agent;
        } else {
            agentsStore.push(agent);
        }
        return agent;
    },

    delete: async (id: string): Promise<void> => {
        await delay(400);
        agentsStore = agentsStore.filter(a => a.id !== id);
    }
};
