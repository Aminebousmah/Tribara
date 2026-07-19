import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";


export const processFile = async (file: File): Promise<string> => {
    try {
        if (file.type === "application/pdf") {
            return await extractTextFromPDF(file);
        } else if (
            file.type === "application/msword" ||
            file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            return await extractTextFromWord(file);
        } else {
            throw new Error("Unsupported file type");
        }
    } catch (error) {
        console.error("File processing error:", error);
        throw error;
    }
};

const cleanExtractedText = (text: string): string => {
    // Normalize diacritics (e.g., a → à)
    text = text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

    // Replace specific words and fix contractions
    text = text
        .replace(/\bdun(e)?\b/gi, "d'une") // Fix "dune" to "d'une"
        .replace(/\bqu(en)?\b/gi, "qu'en") // Fix "quen" to "qu'en"
        .replace(/\ba\b/gi, "à") // Fix "a" when it should be "à"
        .replace(/\b([Cc])est\b/g, "$1'est") // Fix "cest" to "c'est"
        .replace(/\bl\b/gi, "l'") // Add apostrophes to "l" (e.g., "lequipe" → "l'équipe")
        .replace(/\bs\b/gi, "s'"); // Add apostrophes to "s" (e.g., "saide" → "s'aide")

    // Remove redundant spaces and fix punctuation
    text = text
        .replace(/\s+/g, " ") // Replace multiple spaces with a single space
        .replace(/\s([.,!?])/g, "$1") // Remove spaces before punctuation
        .replace(/[^\w\s.,?!àâäéèêëîïôöùûüç'-]/g, "") // Remove special characters except allowed ones
        .trim(); // Remove leading/trailing whitespace

    // Condense verbose or irrelevant sections
    text = text.replace(
        /Contacts[\s\S]*$/i, // Remove "Contacts" section (example)
        ""
    );

    return text;
};

const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let extractedText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item) => {
                if ("str" in item) {
                    return item.str;
                }
                return "";
            })
            .join(" ");
        extractedText += `${pageText} `;
    }
    return cleanExtractedText(extractedText);
};

const extractTextFromWord = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const arrayBuffer = event.target?.result as ArrayBuffer;
                const result = await mammoth.extractRawText({ arrayBuffer });
                resolve(cleanExtractedText(result.value));
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
};