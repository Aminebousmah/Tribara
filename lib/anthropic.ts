import Anthropic from "@anthropic-ai/sdk";

/**
 * Client Anthropic partagé par les routes API.
 * La clé est lue depuis ANTHROPIC_API_KEY et ne quitte jamais le serveur :
 * ce module ne doit être importé que depuis des route handlers.
 */
export const anthropic = new Anthropic();

/** Modèle utilisé pour toutes les analyses. */
export const MODEL = "claude-opus-4-8";

/**
 * Appelle Claude en lui imposant un schéma JSON de sortie, et renvoie
 * l'objet déjà parsé. `output_config.format` garantit que la réponse
 * respecte le schéma, donc pas de nettoyage de markdown à faire ici.
 */
export async function askClaudeForJson<T>({
    system,
    prompt,
    schema,
    effort = "medium",
    maxTokens = 4096,
}: {
    system: string;
    prompt: string;
    schema: Record<string, unknown>;
    effort?: "low" | "medium" | "high";
    maxTokens?: number;
}): Promise<T> {
    const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        system,
        thinking: { type: "adaptive" },
        output_config: {
            effort,
            format: { type: "json_schema", schema },
        },
        messages: [{ role: "user", content: prompt }],
    });

    if (response.stop_reason === "max_tokens") {
        throw new Error("Réponse tronquée par le modèle (max_tokens atteint).");
    }

    const text = response.content.find((block) => block.type === "text");
    if (!text || text.type !== "text") {
        throw new Error("Le modèle n'a renvoyé aucun contenu texte.");
    }

    return JSON.parse(text.text) as T;
}

/** Traduit une erreur SDK en couple (message, status HTTP) exploitable par une route. */
export function describeAnthropicError(error: unknown): { message: string; status: number } {
    if (error instanceof Anthropic.AuthenticationError) {
        return { message: "Clé API Anthropic invalide ou absente.", status: 401 };
    }
    if (error instanceof Anthropic.RateLimitError) {
        return { message: "Limite de requêtes atteinte, réessayez dans un instant.", status: 429 };
    }
    if (error instanceof Anthropic.APIConnectionError) {
        return { message: "Impossible de joindre l'API Anthropic.", status: 503 };
    }
    if (error instanceof Anthropic.APIError) {
        return { message: error.message, status: error.status ?? 500 };
    }
    return {
        message: error instanceof Error ? error.message : "Erreur inattendue.",
        status: 500,
    };
}
