import { useState } from 'react';
import { analyzeDocument } from '../../../services/geminiService';

export const useDocumentAI = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const askAI = async (content: string, instruction: string): Promise<string> => {
        setIsAnalyzing(true);
        try {
            const response = await analyzeDocument(content, instruction);
            return response;
        } catch (error) {
            console.error(error);
            return "Sorry, I couldn't process that request.";
        } finally {
            setIsAnalyzing(false);
        }
    };

    return {
        askAI,
        isAnalyzing
    };
};
