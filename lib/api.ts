import type { Candidate, ParsedJob, ResumeScore } from "@/public/types";

/**
 * Wrappers côté client vers les routes API du projet. Ces routes appellent
 * Claude côté serveur : la clé Anthropic n'est jamais exposée au navigateur.
 */

async function postJson<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
    });

    if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error ?? `Requête ${url} échouée (${response.status})`);
    }

    return response.json();
}

/** Extrait les mots-clés d'une description de poste rédigée par le recruteur. */
export const generateKeywords = (prompt: string, signal?: AbortSignal): Promise<ParsedJob> =>
    postJson("/api/generate-keywords", { prompt }, signal);

/** Note l'adéquation d'un candidat avec le poste validé. */
export const scoreResume = (
    candidate: Candidate,
    jobDescription: ParsedJob,
    signal?: AbortSignal,
): Promise<ResumeScore> =>
    postJson("/api/score-resume", { cv: candidate, job_description: jobDescription }, signal);
