
import { GoogleGenAI } from "@google/genai";

export const generateDescription = async (itemName: string, keywords: string): Promise<string> => {
  // Fix: Initialize the client inside the function to prevent startup crashes.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const prompt = `Génère une description de produit courte et attrayante en français pour un article nommé "${itemName}".
    Voici quelques caractéristiques ou mots-clés importants : "${keywords}".
    La description doit être concise (2-3 phrases) et mettre en valeur les avantages du produit pour le client. Ne retourne que le texte de la description, sans aucun préambule.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Erreur lors de la génération de la description:", error);
    return "Désolé, une erreur est survenue lors de la génération de la description.";
  }
};
