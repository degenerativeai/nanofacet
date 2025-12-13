
// Helper for timeouts
const safeApiRequest = async (url, options) => {
    const TIMEOUT_MS = 60000; // 60s timeout
    try {
        return await Promise.race([
            fetch(url, options),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Request Timed Out")), TIMEOUT_MS))
        ]);
    } catch (e) {
        return { ok: false, status: 408, text: async () => e.message, json: async () => ({ error: e.message }) };
    }
};

const generateWavespeed = async ({ apiKey, prompt, aspectRatio, resolution }) => {
    const baseUrl = "https://api.wavespeed.ai/api/v3/google/nano-banana-pro/text-to-image";
    console.log(`Generating Image via Wavespeed: ${baseUrl}`);

    const payload = {
        prompt: prompt,
        aspect_ratio: aspectRatio,
        resolution: resolution === '4k' ? "2k" : "1k",
        enable_sync_mode: true,
        enable_base64_output: true,
        output_format: "png"
    };

    try {
        const response = await safeApiRequest(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Wavespeed Error (${response.status}): ${errText}`);
        }

        const data = await response.json();

        // Parse Wavespeed Response
        let resultData = data.data || data;

        if (typeof resultData === 'string') {
            if (resultData.startsWith('http')) return { url: resultData };
            const b64 = resultData.replace(/^data:image\/\w+;base64,/, "");
            return { b64_json: b64 };
        }

        if (resultData.image_url) return { url: resultData.image_url };
        if (resultData.base64) return { b64_json: resultData.base64 };
        if (resultData.url) return { url: resultData.url };

        if (resultData.output) {
            if (resultData.output.url) return { url: resultData.output.url };
            if (resultData.output.base64) return { b64_json: resultData.output.base64 };
        }

        if (Array.isArray(resultData) && resultData[0]) {
            if (resultData[0].b64_json) return { b64_json: resultData[0].b64_json };
            if (resultData[0].url) return { url: resultData[0].url };
        }

        throw new Error("Could not parse image data from Wavespeed response");

    } catch (error) {
        console.error("Wavespeed Generation Failed:", error);
        return { error: error.message };
    }
};

const generateGoogle = async ({ apiKey, prompt, aspectRatio, resolution }) => {
    // Gemini 3 Pro Image Preview
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`;

    console.log(`Generating Image via Google (Gemini 3)`);

    let finalPrompt = prompt;
    if (resolution === '4k') finalPrompt = `4K Ultra HD, Highly Detailed, ${prompt}`;

    const payload = {
        contents: [{ parts: [{ text: finalPrompt }] }],
        generationConfig: {
            candidateCount: 1,
            imageConfig: {
                imageSize: resolution === '4k' ? '4K' : '2K',
                aspectRatio: aspectRatio
            }
        }
    };

    try {
        const response = await safeApiRequest(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Google Error (${response.status}): ${errText}`);
        }

        const data = await response.json();
        const cand = data.candidates?.[0];

        if (cand?.content?.parts) {
            for (const part of cand.content.parts) {
                if (part.inlineData?.data) return { b64_json: part.inlineData.data };
                if (part.inline_data?.data) return { b64_json: part.inline_data.data };
            }
        }

        if (cand?.finishReason) {
            throw new Error(`Generation Blocked: ${cand.finishReason}`);
        }

        throw new Error("Invalid Google response structure");

    } catch (error) {
        console.error("Google Generation Failed:", error);
        return { error: error.message };
    }
};

export const generateImage = async (options) => {
    const { provider } = options;
    if (provider === 'wavespeed') {
        return generateWavespeed(options);
    } else {
        return generateGoogle(options);
    }
};
