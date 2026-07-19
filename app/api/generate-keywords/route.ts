import { NextResponse } from "next/server";
import { askClaudeForJson, describeAnthropicError } from "@/lib/anthropic";
import type { ParsedJob } from "@/public/types";

const SYSTEM = `Tu es un assistant de recrutement. À partir de la description d'un poste
rédigée librement par un recruteur (parfois complétée par le texte brut d'une fiche de poste),
tu extrais une liste structurée de mots-clés servant à filtrer des candidats.

Règles :
- Répartis les compétences en trois catégories : indispensables (must_have),
  appréciées (nice_to_have) et différenciantes (complementary).
- Un mot-clé est court : une technologie, un outil, un diplôme, une soft skill.
  Pas de phrase, pas de doublon entre catégories.
- Vise 4 à 8 mots-clés par catégorie, en français, sauf pour les noms de
  technologies qui gardent leur orthographe usuelle (TypeScript, PostgreSQL...).
- Si une information n'est pas donnée (localisation, séniorité), renvoie une
  chaîne vide plutôt que d'inventer.`;

const SCHEMA = {
    type: "object",
    properties: {
        job_title: { type: "string", description: "Intitulé du poste recherché" },
        seniority: { type: "string", description: "Niveau d'expérience attendu, ou chaîne vide" },
        location: { type: "string", description: "Localisation du poste, ou chaîne vide" },
        summary: { type: "string", description: "Résumé du profil recherché en une à deux phrases" },
        keywords: {
            type: "object",
            properties: {
                competencies: {
                    type: "object",
                    properties: {
                        must_have: { type: "array", items: { type: "string" } },
                        nice_to_have: { type: "array", items: { type: "string" } },
                        complementary: { type: "array", items: { type: "string" } },
                    },
                    required: ["must_have", "nice_to_have", "complementary"],
                    additionalProperties: false,
                },
            },
            required: ["competencies"],
            additionalProperties: false,
        },
    },
    required: ["job_title", "seniority", "location", "summary", "keywords"],
    additionalProperties: false,
};

export async function POST(request: Request) {
    let prompt: string;
    try {
        ({ prompt } = await request.json());
    } catch {
        return NextResponse.json({ error: "Corps de requête JSON invalide." }, { status: 400 });
    }

    if (typeof prompt !== "string" || prompt.trim().length === 0) {
        return NextResponse.json({ error: "Le champ 'prompt' est requis." }, { status: 400 });
    }

    try {
        const parsedJob = await askClaudeForJson<ParsedJob>({
            system: SYSTEM,
            prompt: `Description du poste :\n\n${prompt}`,
            schema: SCHEMA,
        });
        return NextResponse.json(parsedJob);
    } catch (error) {
        const { message, status } = describeAnthropicError(error);
        console.error("generate-keywords:", error);
        return NextResponse.json({ error: message }, { status });
    }
}
