# CLAUDE.md

Instructions pour Claude Code lorsqu'il travaille sur ce dépôt.

## Le projet

Tribara est une application Next.js 15 (App Router, TypeScript) de présélection
de candidats. Le recruteur décrit un poste, Claude en extrait des mots-clés, le
recruteur les valide, puis Claude note chaque CV du jeu de données face au poste.

Il n'y a pas de base de données ni de backend séparé : les candidats sont lus
depuis `public/candidates.json` et toute la logique serveur tient dans deux route
handlers.

## Commandes

```sh
npm run dev      # serveur de développement (http://localhost:3000/search)
npm run build    # build de production — à lancer avant de considérer une tâche finie
npm run lint     # ESLint
npx tsc --noEmit # typecheck seul, plus rapide que le build
```

## Architecture

Le parcours complet vit dans `app/search/page.tsx`, qui pilote trois étapes via
un `currentStep` local (Création → Validation → Résultat) et délègue le rendu à
`components/search/Step*.tsx`.

Flux de données :

```
StepContent ──(texte libre + fiche de poste)──▶ lib/api.ts
                                                    │
                              POST /api/generate-keywords ──▶ Claude
                                                    │
                                              ParsedJob
                                                    │
StepValidation ──(mots-clés ajustés)──▶ ParsedJob mis à jour
                                                    │
                        POST /api/score-resume (1 appel par candidat) ──▶ Claude
                                                    │
StepResults ◀── candidats notés, filtrés et triés
```

Deux contrats de données, tous deux dans `public/types.ts` :

- `ParsedJob` — sortie de `/api/generate-keywords`. `keywords.competencies`
  contient `must_have`, `nice_to_have` et `complementary`. `StepValidation` lit
  et réécrit exactement ces trois tableaux.
- `ResumeScore` — sortie de `/api/score-resume` : `rating` (0-100),
  `relevant_experience` (années) et `explanation`.

Si vous modifiez un schéma JSON dans une route, mettez à jour le type
correspondant dans `public/types.ts` dans le même changement.

## Appels à Claude

Tout passe par `askClaudeForJson()` dans `lib/anthropic.ts`, qui impose un schéma
via `output_config.format` et renvoie l'objet déjà parsé. N'écrivez pas d'appel
`anthropic.messages.create` directement dans une route : ajoutez plutôt un
schéma et appelez le helper.

Conventions en place :

- Modèle : `claude-opus-4-8` (constante `MODEL`), pensée adaptative activée.
- `effort: "medium"` pour l'extraction de mots-clés, `"low"` pour la notation
  (un appel par candidat, la latence compte).
- Les schémas exigent `additionalProperties: false` et listent tous les champs
  dans `required`.
- Les erreurs SDK passent par `describeAnthropicError()` pour renvoyer un couple
  message/status cohérent. Une route ne doit jamais laisser fuir une stack trace
  au client.

## Contraintes à respecter

**La clé API reste côté serveur.** `lib/anthropic.ts` ne doit être importé que
depuis `app/api/**`. Le client passe par `lib/api.ts`, qui ne fait que des
`fetch` vers `/api/*`.

**Pas de données personnelles réelles dans le dépôt.** `public/candidates.json`
est un jeu fictif. N'y réintroduisez jamais de vrais noms, emails, téléphones ou
profils LinkedIn, et ne versionnez pas de CV bruts (`CV/` et `out/` sont
ignorés). La fonction `anonymize()` de `app/api/score-resume/route.ts` retire les
champs de contact avant l'envoi au modèle : ne la contournez pas.

**Le français est la langue du produit.** Interface, prompts système et messages
d'erreur destinés à l'utilisateur sont en français. Les commentaires de code le
sont aussi.

## Style

Le code existant utilise une indentation de 4 espaces, pas de point-virgule dans
les composants React (`app/`, `components/`) mais des points-virgules dans
`lib/` et les routes. Alignez-vous sur le fichier que vous modifiez plutôt que
d'uniformiser.

Les composants de `components/ui/` viennent de shadcn/ui : ne les réécrivez pas à
la main, régénérez-les si besoin. Plusieurs composants shadcn non utilisés ont
été supprimés car leurs dépendances n'étaient pas installées — si vous en
ajoutez un, installez la dépendance Radix correspondante dans le même
changement, sinon le build casse.
