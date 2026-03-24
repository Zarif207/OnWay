/**
 * Senior-Level Production OCR Parser
 * PIPELINE: AUTHENTICITY GATE -> TYPE DETECTION -> ANCHOR EXTRACTION -> CLEAN -> VALIDATE
 */

const GOVT_KEYWORDS = ["GOVERNMENT OF BANGLADESH", "PEOPLE'S REPUBLIC", "DRIVING LICENCE", "PASSPORT", "NATIONAL ID", "BRTA", "BANGLADESH"];
const FORBIDDEN_WORDS = ["FATHER", "MOTHER", "HUSBAND", "GUARDIAN", "SPOUSE"];
const GARBAGE_TOKENS = ["BAT", "MIME", "PRE", "LC", "FREN", "OUS", "BGD", "NID"];
const NAME_PREFIXES = ["MD", "MD.", "MOHAMMAD", "MOHAMMED", "MOHAMMAD.", "LATE", "MR", "MRS"];

/**
 * 1. Document Authenticity Gate (MANDATORY)
 */
export function isDocumentAuthentic(text) {
    if (!text) return false;
    const t = text.toUpperCase();
    return GOVT_KEYWORDS.some(k => t.includes(k));
}

/**
 * 2. Document Type Detection
 */
export function detectDocumentType(text) {
    if (!text) return null;
    const t = text.toUpperCase();

    if (t.includes("PASSPORT") || t.includes("P<BGD")) return "Passport";
    if (t.includes("DRIVING LICENCE") || t.includes("DRIVING LICENSE") || t.includes("ROAD TRANSPORT AUTHORITY")) return "Driving License";
    if (t.includes("NATIONAL ID") || t.includes("NID")) return "NID";

    return null;
}

/**
 * 3. Ultra-Strict Name Extraction (Anchor-Based)
 * Logic: Extract FULL NAME LINE after "Name:" or "Name :"
 */
export function extractFullName(text) {
    if (!text) return null;
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const upLine = line.toUpperCase();

        // Must contain "NAME" and NOT forbidden family words
        if (upLine.includes("NAME") && !FORBIDDEN_WORDS.some(w => upLine.includes(w))) {
            let rawName = line.replace(/name[:\-]?\s*/i, "").trim();

            // Handle multi-line: If name is missing or too short on current line, take NEXT line
            if (!rawName || rawName.length < 3) {
                if (lines[i + 1]) {
                    const nextUp = lines[i + 1].toUpperCase();
                    // Ensure next line isn't another field label or govt text
                    if (!FORBIDDEN_WORDS.some(w => nextUp.includes(w)) &&
                        !GOVT_KEYWORDS.some(k => nextUp.includes(k)) &&
                        !nextUp.includes("DATE") && !nextUp.includes("ID NO")) {
                        rawName = lines[i + 1];
                    }
                }
            }

            // Clean & Validate candidate
            const cleaned = finalizeName(rawName);
            if (validateName(cleaned)) return cleaned;
        }
    }

    // Fallback: Longest All-Caps line (that isn't govt text)
    const candidates = lines.filter(l => {
        const up = l.toUpperCase();
        return l === up && l.length > 5 &&
            !GOVT_KEYWORDS.some(k => up.includes(k)) &&
            !FORBIDDEN_WORDS.some(w => up.includes(w));
    });

    for (let c of candidates) {
        const cleaned = finalizeName(c);
        if (validateName(cleaned)) return cleaned;
    }

    return null;
}

/**
 * 4. Cleaning & Normalization
 */
function finalizeName(raw) {
    let name = raw.toUpperCase();

    // Remove prefixes strictly
    NAME_PREFIXES.forEach(prefix => {
        const regex = new RegExp(`\\b${prefix.replace(".", "\\.")}\\b`, "gi");
        name = name.replace(regex, "");
    });

    // Remove noise, symbols, and numbers
    name = name.replace(/[^A-Z\s]/g, "");

    // Normalize spacing
    return name.replace(/\s+/g, " ").trim();
}

/**
 * 5. Fail-Safe Validator
 */
function validateName(name) {
    if (!name || name.length < 3) return false;

    const parts = name.split(" ");
    if (parts.length < 2) return false; // Reject single word names like "MIA"

    const upName = name.toUpperCase();
    if (GARBAGE_TOKENS.some(t => upName.includes(t))) return false;
    if (/\d/.test(name)) return false; // No numbers allowed

    return true;
}

/**
 * 6. Date & ID Parsing
 */
export function extractDOB(text) {
    const dateRegex = /(\d{1,2}[\s\-\/](?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|\d{1,2})[\s\-\/]\d{4})/i;
    const match = text.match(dateRegex);
    return match ? match[1].trim() : "";
}

export function extractIDNumber(text, type) {
    if (type === "Passport") {
        const pMatch = text.match(/Passport No[:\s]+([A-Z0-9]+)/i);
        return pMatch ? pMatch[1] : "";
    }
    const nidMatch = text.match(/\b(\d{10}|\d{13}|\d{17})\b/);
    if (nidMatch) return nidMatch[1];

    const idMatch = text.match(/(?:ID NO|LICENCE NO)[:\s]+([A-Z0-9\-\s]{5,20})/i);
    return idMatch ? idMatch[1].trim() : "";
}

/**
 * 7. Unified Senior Parser
 */
export const parseDocument = (text) => {
    if (!text) return { isValid: false, error: "Empty OCR result." };

    // Stage 1: Authenticity Gate
    if (!isDocumentAuthentic(text)) {
        return { isValid: false, error: "Invalid document. Upload NID, License or Passport." };
    }

    // Stage 2: Type Detection
    const docType = detectDocumentType(text);
    if (!docType) {
        return { isValid: false, error: "Document type unrecognized. Use NID, License or Passport." };
    }

    // Stage 3: Extraction
    const fullName = extractFullName(text);
    if (!fullName) {
        return { isValid: false, error: "Could not read name clearly. Please upload a clearer image." };
    }

    const parts = fullName.split(" ");
    const firstName = parts[0];
    const lastName = parts.slice(1).join(" "); // Splitting: First word as firstName, rest as lastName

    return {
        isValid: true,
        documentType: docType,
        fullName,
        firstName,
        lastName,
        dateOfBirth: extractDOB(text),
        documentNumber: extractIDNumber(text, docType),
        isSuccess: true
    };
};
