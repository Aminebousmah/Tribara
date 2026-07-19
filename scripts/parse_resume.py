"""Extraction de texte et de données de contact depuis des CV (PDF ou image).

Script hors-ligne utilisé pour construire le jeu de données de démo
(`public/candidates.json`). Il n'est pas appelé par l'application Next.js.

Dépendances système : Tesseract OCR et Poppler doivent être installés et
présents dans le PATH.

    pip install -r scripts/requirements.txt
    python scripts/parse_resume.py CV/ --anonymize --output out/contacts.json
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import cv2
import pytesseract
from pdf2image import convert_from_path

EMAIL_RE = re.compile(r"\b[\w.-]+@[\w.-]+\.\w{2,4}\b")
LINKEDIN_RE = re.compile(r"(?:https?://)?(?:www\.)?linkedin\.com/[^\s]+")

IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg"}


def extract_text_from_pdf(path: Path) -> str:
    """Convertit chaque page en image puis applique l'OCR."""
    return "\n".join(pytesseract.image_to_string(page, lang="eng") for page in convert_from_path(path))


def extract_text_from_image(path: Path) -> str:
    image = cv2.imread(str(path))
    if image is None:
        raise ValueError(f"Image illisible : {path}")
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return pytesseract.image_to_string(gray, lang="eng")


def extract_contact_info(text: str) -> dict[str, list[str]]:
    """Repère les emails et profils LinkedIn présents dans le texte."""
    return {
        "email": sorted(set(EMAIL_RE.findall(text))),
        "linkedin": sorted(set(LINKEDIN_RE.findall(text))),
    }


def anonymize_text(text: str, contact: dict[str, list[str]]) -> str:
    for email in contact["email"]:
        text = text.replace(email, "[EMAIL MASQUÉ]")
    for linkedin in contact["linkedin"]:
        text = text.replace(linkedin, "[LINKEDIN MASQUÉ]")
    return text


def parse_resume(path: Path, anonymize: bool = False) -> tuple[str, dict[str, list[str]]]:
    """Renvoie le texte du CV (éventuellement anonymisé) et les contacts trouvés."""
    if path.suffix.lower() == ".pdf":
        text = extract_text_from_pdf(path)
    elif path.suffix.lower() in IMAGE_SUFFIXES:
        text = extract_text_from_image(path)
    else:
        raise ValueError(f"Format non supporté : {path.suffix} (attendu : PDF, PNG ou JPEG)")

    contact = extract_contact_info(text)
    return (anonymize_text(text, contact) if anonymize else text), contact


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Fichier CV ou dossier de CV")
    parser.add_argument(
        "--anonymize",
        action="store_true",
        help="Masque emails et profils LinkedIn dans le texte affiché",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Fichier JSON où écrire les contacts extraits (non versionné)",
    )
    args = parser.parse_args()

    files = sorted(p for p in args.source.rglob("*") if p.is_file()) if args.source.is_dir() else [args.source]
    if not files:
        raise SystemExit(f"Aucun fichier trouvé dans {args.source}")

    contacts: dict[str, dict[str, list[str]]] = {}
    for path in files:
        try:
            text, contact = parse_resume(path, anonymize=args.anonymize)
        except (ValueError, OSError) as error:
            print(f"[ignoré] {path} : {error}")
            continue

        contacts[path.name] = contact
        print(f"=== {path.name} ===\n{text}\n")

    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(contacts, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"Contacts écrits dans {args.output}")


if __name__ == "__main__":
    main()
