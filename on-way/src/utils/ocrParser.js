/**
 * OCR Parser Utility
 * Extracts structured data from raw OCR text using label-anchored field parsing.
 * Hardened for strict ID validation and numeric-mandatory matching.
 */

/**
 * Normalizes various date formats (DD-MMM-YYYY, DD/MM/YYYY) to YYYY-MM-DD.
 */
export const normalizeDate = (dateStr) => {
    if (!dateStr) return "";
    let cleanStr = dateStr.replace(/[^\w\s\-\/\.]/g, "").trim();

    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    // Pattern: 17-MAY-2000 or 17 MAY 2000
    const mmmMatch = cleanStr.match(/(\d{1,2})[\s\-\/\.]?([A-Za-z]{3})[\s\-\/\.]?(\d{4})/i);
    if (mmmMatch) {
        const day = mmmMatch[1].padStart(2, '0');
        const monthIndex = months.indexOf(mmmMatch[2].toUpperCase());
        if (monthIndex !== -1) {
            const year = mmmMatch[3];
            return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${day}`;
        }
    }

    // Pattern: 17/05/2000
    const digitalMatch = cleanStr.match(/(\d{1,2})[\s\-\/\.]+(\d{1,2})[\s\-\/\.]+(\d{4})/);
    if (digitalMatch) {
        const day = digitalMatch[1].padStart(2, '0');
        const month = digitalMatch[2].padStart(2, '0');
        const year = digitalMatch[3];
        return `${year}-${month}-${day}`;
    }

    return cleanStr;
};

/**
 * Removes OCR garbage words and symbols
 */
export function cleanText(text) {
    if (!text) return "";
    let clean = text.replace(/[^A-Za-z\s]/g, " "); // Replace non-alphabets with space

    // Remove specific noisy keywords
    const noiseWords = [
        "nationality", "bangladesh", "license", "licence", "wes", "ange",
        "name", "blood", "group", "dob", "date of birth", "id no", "issue date", "expiry date"
    ];

    noiseWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        clean = clean.replace(regex, "");
    });

    return clean.replace(/\s+/g, " ").trim();
}

/**
 * Label-Based Name Extraction
 */
export function extractName(text) {
    if (!text) return { firstName: "", lastName: "", fullName: "" };

    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    let nameLine = "";

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        if (
            line === "name" ||
            line === "name / name" ||
            line === "নাম" ||
            line === "full name" ||
            line.includes("name / name")
        ) {
            if (lines[i + 1]) {
                nameLine = lines[i + 1];
                break;
            }
        }
    }

    if (!nameLine) {
        for (const line of lines) {
            if (/^[A-Z\s]{8,50}$/.test(line) && !line.includes("NAME") && !line.includes("ID")) {
                nameLine = line;
                break;
            }
        }
    }

    // Clean OCR garbage from name
    nameLine = cleanText(nameLine);
    const parts = nameLine.split(/\s+/).filter(Boolean);

    if (parts.length === 0) return { firstName: "", lastName: "", fullName: "" };

    const fullName = parts.join(" ");
    if (parts.length === 1) return { firstName: parts[0], lastName: "", fullName };

    return {
        firstName: parts[0],
        lastName: parts[parts.length - 1],
        fullName
    };
}

/**
 * Blood Group Extractor
 */
export function extractBloodGroup(text) {
    const match = text.match(/(A|B|AB|O)[+-]/i);
    return match ? match[0].toUpperCase() : null;
}

/**
 * Robust Document Number Extractor
 * MANDATORY: Must contain at least one digit [0-9].
 * BLACKLIST: Ignores words like "PROFESSIONAL", "BANGLADESH".
 */
export function extractDocumentNumber(text) {
    if (!text) return "";

    const blacklist = ["PROFESSIONAL", "BANGLADESH", "DRIVING", "LICENSE", "LICENCE", "NATIONAL", "AUTHORITY"];

    // Find all alphanumeric sequences between 10-20 chars
    const candidates = text.match(/[A-Z0-9]{10,20}/gi) || [];

    for (const candidate of candidates) {
        const upper = candidate.toUpperCase();

        // 1. Must contain at least one number
        if (!/[0-9]/.test(upper)) continue;

        // 2. Reject if it IS in the blacklist
        if (blacklist.includes(upper)) continue;

        // 3. Reject if it is a common label or non-numeric word
        if (upper === "GOVERNMENT") continue;

        // Found a valid-looking ID
        return upper;
    }

    return "";
}

/**
 * Detect Document Type with Proper Mapping
 */
export const detectDocumentType = (text) => {
    const lowerText = text.toLowerCase();

    // Explicit mappings requested by user
    if (lowerText.includes("driving") || lowerText.includes("licence")) return "Driving License";
    if (lowerText.includes("national id") || lowerText.includes("nid") || lowerText.includes("জাতীয় পরিচয়")) return "NID";
    if (lowerText.includes("passport")) return "Passport";

    return "unknown";
};

/**
 * Main Parser
 */
export const parseDocument = (type, text) => {
    if (!text) return {};

    const detectedType = detectDocumentType(text);
    const finalType = (type && type !== "unknown") ? type : detectedType;

    const names = extractName(text);
    const bloodGroup = extractBloodGroup(text);

    // Strict ID Extraction
    const docNumber = extractDocumentNumber(text);

    // Date Parsing
    let dob = "";
    const dobLabelMatch = text.match(/(?:dob|date of birth|জন্ম তারিখ)[\s\-\/\.]*(\d{1,2}[\s\-\/\.]+[A-Z]{3,9}[\s\-\/\.]+\d{4}|\d{1,2}[\s\-\/\.]+\d{1,2}[\s\-\/\.]+\d{4})/i);
    if (dobLabelMatch) {
        dob = normalizeDate(dobLabelMatch[1]);
    } else {
        const dateMatch = text.match(/\d{1,2}[\s\-\/\.][A-Z]{3,9}[\s\-\/\.]\d{4}|\d{1,2}[\s\-\/\.]\d{1,2}[\s\-\/\.]\d{4}/i);
        if (dateMatch) dob = normalizeDate(dateMatch[0]);
    }

    const parsed = {
        firstName: names.firstName,
        lastName: names.lastName,
        dateOfBirth: dob,
        bloodGroup: bloodGroup,
        documentNumber: docNumber,
        documentType: finalType,
        rawText: text
    };

    // Mandatory Debug Log
    console.log("PARSED OBJECT:", parsed);

    return parsed;
};
