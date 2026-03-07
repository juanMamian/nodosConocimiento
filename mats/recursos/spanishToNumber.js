class SpanishNumbers {
    // ── Lookup tables ────────────────────────────────────────────────────────────

    static #ONES = {
        cero: 0, uno: 1, un: 1, una: 1, dos: 2, tres: 3, cuatro: 4,
        cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9,
        diez: 10, once: 11, doce: 12, trece: 13, catorce: 14,
        quince: 15, dieciséis: 16, dieciseis: 16, diecisiete: 17,
        dieciocho: 18, diecinueve: 19,
        veinte: 20, veintiuno: 21, veintiún: 21, veintiuna: 21,
        veintidós: 22, veintidos: 22, veintitrés: 23, veintitres: 23,
        veinticuatro: 24, veinticinco: 25, veintiséis: 26, veintiseis: 26,
        veintisiete: 27, veintiocho: 28, veintinueve: 29,
    };

    static #TENS = {
        treinta: 30, cuarenta: 40, cincuenta: 50,
        sesenta: 60, setenta: 70, ochenta: 80, noventa: 90,
    };

    static #HUNDREDS = {
        cien: 100, ciento: 100,
        doscientos: 200, doscientas: 200,
        trescientos: 300, trescientas: 300,
        cuatrocientos: 400, cuatrocientas: 400,
        quinientos: 500, quinientas: 500,
        seiscientos: 600, seiscientas: 600,
        setecientos: 700, setecientas: 700,
        ochocientos: 800, ochocientas: 800,
        novecientos: 900, novecientas: 900,
    };

    // ── Public static API ────────────────────────────────────────────────────────

    /**
     * Convert a Spanish number word (or phrase) to its numeric value.
     *
     * Supports: 0–999 999 999 (cero … novecientos noventa y nueve millones
     *           novecientos noventa y nueve mil novecientos noventa y nueve)
     *
     * @param  {string} word  Spanish number word/phrase (case-insensitive).
     * @returns {number}       The corresponding integer, or NaN if unrecognised.
     *
     * @example
     * SpanishNumbers.toNumber("diecinueve")        // 19
     * SpanishNumbers.toNumber("cuarenta y dos")    // 42
     * SpanishNumbers.toNumber("un millón")         // 1_000_000
     * SpanishNumbers.toNumber("doscientos cuarenta y tres mil setecientos doce")
     *                                               // 243_712
     */
    static splitByAlternatives(input, separators) {
        const normalized = input.trim().toLowerCase();

        for (const separator of separators) {
            const sep = separator.trim().toLowerCase();
            const index = normalized.indexOf(sep);

            if (index === -1) continue;

            const left = input.slice(0, index).trim();
            const right = input.slice(index + separator.length).trim();

            if (left === "" || right === "") {
                throw new Error(
                    `Separator "${separator}" was found, but one side is empty. ` +
                    `Got: left="${left}", right="${right}"`
                );
            }

            return [left, right];
        }

        throw new Error(
            `No valid separator found in "${input}". ` +
            `Tried: ${separators.map(s => `"${s}"`).join(", ")}`
        );
    }
    static toNumber(word) {
        // Handle numeric input directly
        if (typeof word === "number") return Number.isFinite(word) ? Math.trunc(word) : NaN;

        // Handle numeric strings like "19" or "1000"
        if (typeof word === "string" && /^\s*-?\d+(\.\d+)?\s*$/.test(word)) {
            const n = Number(word);
            return Number.isFinite(n) ? Math.trunc(n) : NaN;
        }

        if (typeof word !== "string" || !word.trim()) return NaN;

        const normalised = word
            .trim()
            .toLowerCase()
            // collapse extra whitespace
            .replace(/\s+/g, " ")
            // strip optional accents on "un/una" when used as prefix
            .replace(/\bún\b/, "un")
            .replace(/\búna\b/, "una");

        // Fast path: direct single-token lookup
        const direct = SpanishNumbers.#lookupToken(normalised);
        if (direct !== null) return direct;

        // Split on "millones" / "millón" / "millon"
        const millionMatch = normalised.match(
            /^(.*?)\s*mill[oó]n(?:es)?\s*(.*)$/
        );

        if (millionMatch) {
            const millionPart = millionMatch[1].trim() || "uno";
            const remainder = millionMatch[2].trim();
            const millionVal = SpanishNumbers.#parseUpToThousands(millionPart);
            if (isNaN(millionVal)) return NaN;
            const remainderVal = remainder
                ? SpanishNumbers.#parseUpToThousands(remainder)
                : 0;
            if (isNaN(remainderVal)) return NaN;
            return millionVal * 1_000_000 + remainderVal;
        }

        return SpanishNumbers.#parseUpToThousands(normalised);
    }

    // ── Private helpers ──────────────────────────────────────────────────────────

    /** Parse a Spanish phrase that represents a value up to 999 999. */
    static #parseUpToThousands(phrase) {
        // Split on "mil"
        const thousandMatch = phrase.match(/^(.*?)\s*\bmil\b\s*(.*)$/);

        if (thousandMatch) {
            const thousandPart = thousandMatch[1].trim();
            const remainder = thousandMatch[2].trim();

            // "mil" alone means 1 000; "dos mil" means 2 000, etc.
            const thousandVal = thousandPart
                ? SpanishNumbers.#parseHundredsAndBelow(thousandPart)
                : 1;
            if (isNaN(thousandVal)) return NaN;

            const remainderVal = remainder
                ? SpanishNumbers.#parseHundredsAndBelow(remainder)
                : 0;
            if (isNaN(remainderVal)) return NaN;

            return thousandVal * 1_000 + remainderVal;
        }

        return SpanishNumbers.#parseHundredsAndBelow(phrase);
    }

    /**
     * Parse a Spanish phrase that represents 0–999.
     * Handles patterns like:
     *   "ciento cuarenta y tres"
     *   "cuarenta y tres"
     *   "diecinueve"
     */
    static #parseHundredsAndBelow(phrase) {
        if (!phrase) return NaN;

        // Direct single-token lookup first
        const direct = SpanishNumbers.#lookupToken(phrase);
        if (direct !== null) return direct;

        let total = 0;

        // Extract a leading hundreds word if present (longest match wins, so 'ciento' beats 'cien')
        const hundredsEntry = Object.entries(SpanishNumbers.#HUNDREDS)
            .filter(([h]) => phrase.startsWith(h))
            .sort((a, b) => b[0].length - a[0].length)[0];

        if (hundredsEntry) {
            total += hundredsEntry[1];
            phrase = phrase.slice(hundredsEntry[0].length).trim();
            if (!phrase) return total;
        }

        // What remains could be a bare ones/teens word ("ciento uno")
        // or a full tens-and-ones phrase ("ciento treinta y uno")
        const onesDirectly = SpanishNumbers.#lookupToken(phrase);
        if (onesDirectly !== null) return total + onesDirectly;

        const remainder = SpanishNumbers.#parseTensAndOnes(phrase);
        if (isNaN(remainder)) return NaN;
        return total + remainder;
    }

    /**
     * Parse a phrase that is purely in the range 0–99.
     * Handles "y" connective: "treinta y uno"
     */
    static #parseTensAndOnes(phrase) {
        if (!phrase) return NaN;

        // Direct lookup (ones, teens, compound twenties, standalone tens)
        const direct = SpanishNumbers.#lookupToken(phrase);
        if (direct !== null) return direct;

        // Try splitting on " y "
        const yIndex = phrase.indexOf(" y ");
        if (yIndex !== -1) {
            const left = phrase.slice(0, yIndex).trim();
            const right = phrase.slice(yIndex + 3).trim();
            const lv = SpanishNumbers.#TENS[left] ?? NaN;
            const rv = SpanishNumbers.#lookupToken(right) ?? NaN;
            if (!isNaN(lv) && !isNaN(rv)) return lv + rv;
        }

        return NaN;
    }

    /**
     * Look up a single token across all tables.
     * Returns the numeric value or null if not found.
     */
    static #lookupToken(token) {
        if (token in SpanishNumbers.#ONES) return SpanishNumbers.#ONES[token];
        if (token in SpanishNumbers.#TENS) return SpanishNumbers.#TENS[token];
        if (token in SpanishNumbers.#HUNDREDS) return SpanishNumbers.#HUNDREDS[token];
        return null;
    }
}
