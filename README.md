# Tribara

Application de présélection de candidats. Le recruteur décrit le profil qu'il
cherche en langage naturel ; l'application en extrait des mots-clés avec Claude,
laisse le recruteur les ajuster, puis note chaque CV de la base par rapport au
poste et affiche les candidats classés.

Projet de fin d'études, repris et modernisé : la couche IA, initialement servie
par un backend Python externe, est désormais intégrée à Next.js et utilise
l'API Anthropic (Claude).

## Fonctionnement

L'application se parcourt en trois étapes :

1. **Création** — le recruteur décrit le poste (texte libre, métier, secteur,
   localisation) ou dépose une fiche de poste en PDF/Word, dont le texte est
   extrait dans le navigateur. `POST /api/generate-keywords` envoie le tout à
   Claude, qui renvoie des mots-clés répartis en trois catégories :
   indispensables, appréciés et différenciants.
2. **Validation** — les mots-clés s'affichent en trois colonnes. Le recruteur
   les déplace d'une catégorie à l'autre, en ajoute ou en supprime par
   glisser-déposer. Rien n'est envoyé au modèle à cette étape.
3. **Résultat** — `POST /api/score-resume` est appelée une fois par candidat.
   Claude renvoie un score sur 100, un nombre d'années d'expérience pertinentes
   et une justification. Les trois premiers candidats sont analysés d'abord pour
   afficher des résultats rapidement, le reste arrive progressivement. Des
   filtres avancés et un tri permettent ensuite d'affiner la liste.

## Stack

- **Next.js 15** (App Router) et **React 18** en TypeScript
- **Tailwind CSS** et composants **shadcn/ui** (Radix)
- **@anthropic-ai/sdk** — modèle `claude-opus-4-8`, sorties structurées JSON
- **dnd-kit** pour le glisser-déposer, **framer-motion** pour les transitions
- **pdfjs-dist** et **mammoth** pour lire les fiches de poste PDF et Word

## Prérequis

- Node.js 18.18 ou plus
- Une clé API Anthropic ([console.anthropic.com](https://console.anthropic.com/settings/keys))

## Installation

```sh
git clone https://github.com/Aminebousmah/Tribara.git
cd Tribara
npm install
```

Copiez `.env.example` en `.env.local` et renseignez votre clé :

```sh
cp .env.example .env.local
```

```dotenv
ANTHROPIC_API_KEY=sk-ant-...
```

Lancez le serveur de développement :

```sh
npm run dev
```

L'application est disponible sur <http://localhost:3000/search>.

> La clé API n'est lue que dans les route handlers (`app/api/**`), côté serveur.
> Elle n'est jamais exposée au navigateur.

## Scripts

| Commande        | Rôle                                     |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Serveur de développement                 |
| `npm run build` | Build de production                      |
| `npm start`     | Sert le build de production              |
| `npm run lint`  | ESLint (configuration Next.js)           |

## Structure

```
app/
  api/generate-keywords/route.ts  Extraction des mots-clés du poste (Claude)
  api/score-resume/route.ts       Notation d'un CV face au poste (Claude)
  search/page.tsx                 Parcours en trois étapes
components/
  search/                         Composants du parcours (étapes, filtres, résultats)
  ui/                             Composants shadcn/ui
lib/
  anthropic.ts                    Client Anthropic et helper de sortie JSON
  api.ts                          Wrappers fetch côté client vers /api
public/
  candidates.json                 Jeu de CV de démonstration (fictif)
  jobs.json, cities.json, industries.json  Listes pour l'autocomplétion
  types.ts                        Types partagés
scripts/
  parse_resume.py                 Parseur de CV OCR hors-ligne (voir ci-dessous)
utils/
  fileProcessor.tsx               Extraction de texte PDF/Word dans le navigateur
```

## Jeu de données

`public/candidates.json` contient 11 profils de démonstration. **Les identités
(noms, emails, téléphones, profils LinkedIn) sont entièrement fictives** ; seules
les compétences et les parcours ont été conservés pour rendre la démo réaliste.
Aucune donnée personnelle réelle n'est versionnée dans ce dépôt.

Les CV envoyés à Claude pour notation sont en plus dépouillés de leurs champs de
contact côté serveur : le modèle ne voit que l'intitulé, le résumé, la
localisation, les formations, les expériences et les compétences.

## Parseur de CV (optionnel)

`scripts/parse_resume.py` est l'outil hors-ligne qui a servi à construire le jeu
de données. Il n'est pas utilisé par l'application. Il nécessite Tesseract OCR et
Poppler installés sur la machine :

```sh
pip install -r scripts/requirements.txt
python scripts/parse_resume.py CV/ --anonymize --output out/contacts.json
```

Les dossiers `CV/` et `out/` sont ignorés par Git.

## Licence

MIT
