/**
 * Senior-Level Production OCR Parser
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
 * 1. Clean OCR Text
 */
export function cleanOCRText(text) {
  if (!text) return [];
  
  // Remove special characters except letters, numbers, spaces, "/", "-"
  const noSpecial = text.replace(/[^A-Za-z0-9\s/-/]/g, " ");
  
  // Normalize spaces and split into lines
  const lines = noSpecial.split("\n").map(l => l.replace(/\s+/g, " ").trim());
  
  const badWords = ["bangladesh", "authority", "government", "id no"];
  
  return lines.filter(line => {
    if (!line || line.length < 2) return false;
    
    const lower = line.toLowerCase();
    for (const bw of badWords) {
      if (lower.includes(bw)) return false;
    }
    
    // Remove lines with long numbers > 5 digits
    const numMatch = line.match(/\d/g);
    if (numMatch && numMatch.length > 5) return false;
    
    return true;
  });
}

/**
 * 2. Extract Date of Birth
 */
export function extractDOB(text) {
  if (!text) return "";
  const lines = text.toLowerCase().split("\n").map(l => l.trim());
  
  const alphaMonthPattern = /\b(\d{1,2})[\s\-\/](jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s\-\/](\d{4})\b/i;
  const numPattern = /\b(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})\b/;
  const isoPattern = /\b(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})\b/;

  const monthMap = { jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12" };

  function parseDate(line) {
    let match = line.match(alphaMonthPattern);
    if (match) {
      let d = match[1].padStart(2, "0");
      let m = monthMap[match[2].toLowerCase()];
      let y = match[3];
      return `${y}-${m}-${d}`;
    }
    match = line.match(numPattern);
    if (match) {
      let d = match[1].padStart(2, "0");
      let m = match[2].padStart(2, "0");
      let y = match[3];
      return `${y}-${m}-${d}`;
    }
    match = line.match(isoPattern);
    if (match) {
      let y = match[1];
      let m = match[2].padStart(2, "0");
      let d = match[3].padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
    return null;
  }

  // Priority 1
  for (const line of lines) {
    if (line.includes("birth") || line.includes("dob")) {
      const parsed = parseDate(line);
      if (parsed) return parsed;
    }
  }

  // Priority 2
  for (const line of lines) {
    const parsed = parseDate(line);
    if (parsed) return parsed;
  }

  return "";
}

/**
 * 3. Extract Blood Group
 */
export function extractBloodGroup(text) {
  if (!text) return "";
  const match = text.toUpperCase().match(/\b(A|B|AB|O)[+\-]/);
  return match ? match[0] : "";
}

/**
 * 4. Smart Name Extraction
 */
export function extractName(lines) {
  if (!lines || lines.length === 0) return "";
  
  let candidates = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();
    let score = 0;
    
    // Label-based
    if (lower.includes("name:") || lower.includes("নাম:")) {
      const raw = line.replace(/.*(?:name|নাম)[\s:]*/i, "").trim();
      if (raw.length > 3) return raw; 
    }
    
    // Scoring
    if (lower.includes("name")) score += 3;
    
    const words = line.split(" ");
    if (words.length >= 2 && words.length <= 3) score += 2;
    if (words.length > 4) score -= 2;
    if (words.length < 2) score -= 2;
    
    if (/^[A-Za-z\s]+$/.test(line)) score += 2; 
    
    const isCapitalized = words.every(w => /^[A-Z]/.test(w));
    if (isCapitalized && words.length > 1) score += 1;
    
    if (/\d/.test(line)) score -= 3;
    if (lower.includes("id") || lower.includes("dob") || lower.includes("birth")) score -= 3;
    
    candidates.push({ line, score });
  }

  if (candidates.length === 0) return "";
  
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].line;
}

/**
 * 5. Clean Name
 */
export function cleanName(name) {
  if (!name) return "";
  const removeWords = ["name", "id", "no", "father", "husband"];
  
  let words = name.split(" ");
  words = words.filter(w => {
    const lower = w.toLowerCase();
    if (lower === "d" || lower === "o") return false;
    if (removeWords.includes(lower)) return false;
    return true;
  });
  
  words = words.map(w => {
    const lower = w.toLowerCase();
    if (lower === "md" || lower === "mohammad") return "Mohammad";
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  });
  
  if (words.length > 3) words = words.slice(0, 3);
  return words.join(" ").trim();
}

/**
 * 6. Split Name
 */
export function splitName(fullName) {
  if (!fullName) return { firstName: "", lastName: "" };
  const parts = fullName.split(/\s+/);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || ""
  };
}

/**
 * 7. Validate Name
 */
export function validateName(name) {
  if (!name) return false;
  if (/\d/.test(name)) return false;
  
  const words = name.split(" ");
  if (words.length < 2) return false;
  
  const lower = name.toLowerCase();
  if (lower.includes("garbage") || lower.includes("authority") || lower.includes("bangladesh") || lower.includes("government")) return false;
  
  return true;
}

/**
 * 8. Final Pipeline
 */
export function processOCR(rawText) {
  if (!rawText) return { fullName: "", firstName: "", lastName: "", dateOfBirth: "", bloodGroup: "", _debug: {} };
  
  const lines = cleanOCRText(rawText);
  
  const nameCandidate = extractName(lines);
  let fullName = cleanName(nameCandidate);
  
  if (!validateName(fullName)) {
    fullName = "";
  }
  
  const { firstName, lastName } = splitName(fullName);
  const dateOfBirth = extractDOB(rawText);
  const bloodGroup = extractBloodGroup(rawText);
  
  return {
    fullName,
    firstName,
    lastName,
    dateOfBirth,
    bloodGroup,
    _debug: { lines, nameCandidate }
  };
}

/**
 * Alias for extractName — kept for backward compatibility.
 * Some components import extractFullName directly.
 */
export function extractFullName(lines) {
  return extractName(lines);
}

/**
 * 9. parseDocument — Full pipeline with structured output.
 * Used by API routes and DocumentOCR component.
 * Returns a validated, structured result including isValid flag.
 */
export function parseDocument(rawText) {
  if (!rawText) {
    return {
      isValid: false,
      error: "No text provided",
      fullName: "", firstName: "", lastName: "",
      documentType: null, documentNumber: "",
      dateOfBirth: "", bloodGroup: "",
    };
  }

  const lines = cleanOCRText(rawText);
  const documentType = detectDocumentType(rawText);

  const nameCandidate = extractName(lines);
  let fullName = cleanName(nameCandidate);
  if (!validateName(fullName)) fullName = "";

  const { firstName, lastName } = splitName(fullName);
  const dateOfBirth = extractDOB(rawText);
  const bloodGroup = extractBloodGroup(rawText);

  // Extract document number (NID / passport / license number)
  const docNumberMatch = rawText.match(/\b(\d{10,17})\b/);
  const documentNumber = docNumberMatch ? docNumberMatch[1] : "";

  const isValid = !!(documentType && (fullName || documentNumber));

  return {
    isValid,
    error: isValid ? null : "Could not detect a valid document. Ensure the image is clear.",
    fullName,
    firstName,
    lastName,
    documentType,
    documentNumber,
    dateOfBirth,
    bloodGroup,
    _debug: { lines, nameCandidate },
  };
}
