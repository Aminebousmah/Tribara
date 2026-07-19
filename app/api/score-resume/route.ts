import { NextResponse } from "next/server";
import { askClaudeForJson, describeAnthropicError } from "@/lib/anthropic";
import type { Candidate, ParsedJob, ResumeScore } from "@/public/types";

const SYSTEM = `Tu es un assistant de recrutement qui évalue l'adéquation entre un CV et un poste.

Règles de notation :
- rating est un entier de 0 à 100. 100 = le candidat coche toutes les compétences
  indispensables et une bonne partie des autres ; 0 = aucun rapport avec le poste.
- Les compétences must_have pèsent le plus lourd, puis nice_to_have, puis complementary.
- relevant_experience est le nombre d'années d'expérience *pertinentes pour ce poste*
  (arrondi à l'entier le plus proche), pas le total de la carrière.
- explanation fait deux à trois phrases en français : ce qui correspond, ce qui manque.
  Reste factuel, appuie-toi uniquement sur le contenu du CV.

Le CV est anonymisé : ne commente jamais l'identité, l'âge, le genre ou l'origine
supposés du candidat, et ne fonde ta note que sur les compétences et l'expérience.`;

const SCHEMA = {
    type: "object",
    properties: {
        rating: { type: "integer", description: "Score d'adéquation de 0 à 100" },
        relevant_experience: { type: "integer", description: "Années d'expérience pertinentes" },
        explanation: { type: "string", description: "Justification de la note en français" },
    },
    required: ["rating", "relevant_experience", "explanation"],
    additionalProperties: false,
};

/**
 * Retire les données de contact avant l'appel au modèle : l'évaluation ne doit
 * porter que sur les compétences et l'expérience.
 */
function anonymize(candidate: Candidate) {
    const { title, summary, location } = candidate.data.general;
    return {
        ...candidate.data,
        general: { title, summary, location },
        score: undefined,
        explanation: undefined,
        relevant_experience: undefined,
    };
}

export async function POST(request: Request) {
    let cv: Candidate;
    let job_description: ParsedJob;
    try {
        ({ cv, job_description } = await request.json());
    } catch {
        return NextResponse.json({ error: "Corps de requête JSON invalide." }, { status: 400 });
    }

    if (!cv?.data || !job_description) {
        return NextResponse.json(
            { error: "Les champs 'cv' et 'job_description' sont requis." },
            { status: 400 },
        );
    }

    try {
        const score = await askClaudeForJson<ResumeScore>({
            system: SYSTEM,
            schema: SCHEMA,
            prompt: [
                "Poste recherché :",
                JSON.stringify(job_description, null, 2),
                "",
                "CV du candidat (anonymisé) :",
                JSON.stringify(anonymize(cv), null, 2),
            ].join("\n"),
            // Une requête par candidat : on privilégie la latence sur cette tâche
            // de notation, plus simple que l'extraction de mots-clés.
            effort: "low",
            maxTokens: 2048,
        });
        return NextResponse.json(score);
    } catch (error) {
        const { message, status } = describeAnthropicError(error);
        console.error("score-resume:", error);
        return NextResponse.json({ error: message }, { status });
    }
}
