/**
 * Flattens the Visual Architect JSON structure into a cohesive paragraph.
 * 
 * @param {string|object} jsonInput - The JSON string or object to flatten.
 * @returns {string} - A clean paragraph suitable for video generation prompts.
 */
export const flattenJsonToParagraph = (jsonInput) => {
    let data;
    try {
        data = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
    } catch (e) {
        // If parsing fails, just return the raw text cleaned up a bit, BUT enforce limit
        const raw = typeof jsonInput === 'string' ? jsonInput.replace(/[{}"]/g, '') : String(jsonInput);
        return enforceCharLimit(raw, 2500);
    }

    if (!data) return "";

    const parts = [];

    // helper to add if exists
    const add = (text) => {
        if (text === null || text === undefined) return;
        const str = String(text);
        if (str.trim().length > 0) parts.push(str.trim());
    };

    // 1. Atmosphere & Context
    if (data.atmosphere_and_context) {
        add(data.atmosphere_and_context.mood);
        add(data.atmosphere_and_context.lighting_source);
        add(data.atmosphere_and_context.shadow_play);
    }

    // 2. Subject Core
    if (data.subject_core) {
        add(data.subject_core.identity);
        add(data.subject_core.styling);
    }

    // 3. Anatomical Details (The meat of the prompt)
    if (data.anatomical_details) {
        add(data.anatomical_details.posture_and_spine);
        add(data.anatomical_details.limb_placement);
        add(data.anatomical_details.hands_and_fingers);
        add(data.anatomical_details.head_and_gaze);
        add(data.anatomical_details.facial_expression);
    }

    // 4. Attire
    if (data.attire_mechanics) {
        add(data.attire_mechanics.garments);
        add(data.attire_mechanics.fit_and_physics);
    }

    // 5. Environment
    if (data.environment_and_depth) {
        add(data.environment_and_depth.background_elements);
        add(data.environment_and_depth.surface_interactions);
    }

    // 6. Visual Texture
    if (data.image_texture) {
        add(data.image_texture.quality_defects);
        add(data.image_texture.camera_characteristics);
    }

    // fallback: if strict schema failed, recursively extract all strings
    if (parts.length === 0) {
        const extractStrings = (obj) => {
            const strings = [];
            if (typeof obj === 'string') return [obj];
            if (typeof obj === 'object' && obj !== null) {
                for (const key in obj) {
                    // Skip meta/debug fields if possible, or just grab everything
                    if (key === 'meta' || key === 'visual_fidelity') continue;
                    strings.push(...extractStrings(obj[key]));
                }
            }
            return strings;
        };

        const allStrings = extractStrings(data);
        if (allStrings.length > 0) return enforceCharLimit(allStrings.join(" "), 2500);

        // Final desperate fallback
        if (data.raw_output) return enforceCharLimit(data.raw_output, 2500);
        if (data.prompt) return enforceCharLimit(data.prompt, 2500);
    }

    // Combine all parts
    const fullText = parts.join(" ");

    return enforceCharLimit(fullText, 2500);
};

/**
 * Compresses text to fit within a character limit, prioritizing semantic density.
 * 
 * @param {string} text - The input text.
 * @param {number} limit - The character limit (default 2500).
 * @returns {string} - The compressed text.
 */
const enforceCharLimit = (text, limit = 2500) => {
    if (text.length <= limit) return text;

    // Strategy 1: Remove common stop words that don't add visual information
    // lists: articles, prepositions, conjunctions that are often noise in Image Gen
    const stopWords = /\b(the|a|an|is|are|was|were|of|in|on|at|to|for|with|by|that|this|it)\b/gi;

    // Replace stop words with single space, then collapse multiple spaces
    let compressed = text.replace(stopWords, ' ').replace(/\s+/g, ' ').trim();

    if (compressed.length <= limit) return compressed;

    // Strategy 2: Truncate at the last complete sentence within the limit to avoid cutting off mid-word
    // unnecessary if strictly barely over, but safer for big prompts.
    const truncated = compressed.substring(0, limit);
    const lastPeriod = truncated.lastIndexOf('.');

    // If we have a period reasonably close to the end (within last 100 chars), cut there.
    if (lastPeriod > limit - 100) {
        return truncated.substring(0, lastPeriod + 1);
    }

    // Otherwise just hard clamp
    return truncated;
};
