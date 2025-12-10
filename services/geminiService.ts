import { GoogleGenAI } from "@google/genai";
import { KnowledgeAsset, AssetType, Agent, AgentTool } from "../types";

// Generate additional instructions based on enabled capabilities/tools
const getToolInstructions = (tools: AgentTool[]) => {
  let instructions = "";

  if (tools.includes(AgentTool.DOC_WRITER)) {
    instructions += `\n[TOOL: DOCUMENT WRITER ENABLED]
        - You have the capability to draft, write, and format documents. 
        - If the user asks for a report, letter, or file, structure your output clearly with headers, bullet points, and professional formatting. 
        - Explicitly state when you are generating a "Draft Document".\n`;
  }

  if (tools.includes(AgentTool.DOC_READER)) {
    instructions += `\n[TOOL: DOCUMENT READER ENABLED]
        - You are optimized to analyze attached documents in depth. 
        - Quote specific sections when answering.\n`;
  }

  if (tools.includes(AgentTool.DATA_ANALYSIS)) {
    instructions += `\n[TOOL: DATA ANALYSIS ENABLED]
        - Focus on numbers, trends, and statistics in the provided context.
        - Present data in markdown tables where possible.\n`;
  }

  if (tools.includes(AgentTool.EMAIL_SENDER)) {
    instructions += `\n[TOOL: EMAIL SENDER ENABLED]
        - You can draft and simulate sending emails.
        - When asked to send an email, strictly format your response as:
          "To: [Recipient]\nSubject: [Subject]\n\n[Body]"
        - Confirm when the email is "Sent" (simulated).\n`;
  }

  if (tools.includes(AgentTool.NOTIFICATION)) {
    instructions += `\n[TOOL: NOTIFICATION SYSTEM ENABLED]
        - You can trigger system alerts.
        - Use the format "[NOTIFICATION] <Alert Message>" to trigger an alert.\n`;
  }

  return instructions;
};

// Helper to simulate RAG context injection
const createSystemInstruction = (agent: Agent, docs: KnowledgeAsset[]) => {
  // Filter docs based on Agent permissions
  const accessibleDocs = docs.filter(doc => agent.allowedAssetIds.includes(doc.id));

  const docList = accessibleDocs
    .map(d => `- [${d.type}] ${d.name} (${d.details})`)
    .join('\n');

  const toolContext = getToolInstructions(agent.tools || []);

  return `${agent.systemInstructions}
  
  ${toolContext}
  
  You have access to the following specific knowledge base assets (ignore any previous instructions about other assets):
  ${docList || "No documents available for this specific query scope."}
  
  When answering:
  1. Adhere strictly to your persona: ${agent.role}.
  2. Use ONLY the provided sources.
  3. If the source is an integration (like Outlook or YouTube), mention that you retrieved it from that specific external app.
  `;
};

export const generateRAGResponse = async (
  prompt: string,
  allAssets: KnowledgeAsset[],
  activeAgent: Agent
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "Error: API Key is missing. Please check your configuration.";
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: createSystemInstruction(activeAgent, allAssets),
        temperature: 0.7,
      }
    });

    return response.text || "I apologize, but I couldn't generate a response based on the available documents.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I encountered an error while processing your request. Please try again.";
  }
};

export const analyzeDocument = async (
  documentContent: string,
  instruction: string
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return "Error: API Key missing";

    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-2.0-flash-exp";

    const response = await ai.models.generateContent({
      model: model,
      contents: `Document Content:\n${documentContent}\n\nInstruction: ${instruction}`,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Failed to analyze document.";
  }
};