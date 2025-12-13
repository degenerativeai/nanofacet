import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import useAppStore from '../store/useAppStore';

// Default System Prompt from IDEM (Fallback if Frame is empty)
export const VISUAL_PROMPT_ARCHITECT = `
# Role & Objective
You are VisionStruct Ultra, a forensic-level computer vision analyst. Your goal is to analyze an image and generate a JSON prompt with extreme anatomical and spatial fidelity for high-end image reproduction.

# Analysis Protocol
1.  **Macro Sweep:** Scene context and atmosphere.
2.  **Anatomical Audit (CRITICAL):** You must analyze the subject's bio-mechanics. Do not just say "leaning." Specify the angle. Do not just say "holding waist." Count the visible fingers and describe the grip pressure. Note spinal curvature (arched, straight, slumped).
3.  **Texture & Flaw Scan:** Identify skin texture, fabric tension lines, and environmental imperfections.

# Guidelines
* **Quantify where possible:** Use degrees for angles (e.g., "bent 45 degrees forward") and counts for digits (e.g., "thumb and two fingers visible").
* **Describe Tension:** Note where clothing pulls tight against the skin or where skin presses against surfaces.
* **No Generalizations:** "Sexy pose" is forbidden. Use "Back arched, hips rotated 30 degrees to camera left, chin over shoulder."

# JSON Output Schema
{
  "meta": {
    "medium": "Source medium (Film/Digital/Phone)",
    "visual_fidelity": "Raw/Polished/Grainy"
  },
  "atmosphere_and_context": {
    "mood": "Psychological tone",
    "lighting_source": "Direction, hardness, and color temp of light",
    "shadow_play": "How shadows interact with the subject's curves/features"
  },
  "subject_core": {
    "identity": "Demographics, build, bosom size/shape, body morphology.",
    "styling": "Hair texture/style, makeup details, skin finish (matte/dewy)."
  },
  "anatomical_details": {
    "posture_and_spine": "CRITICAL: Describe spinal arch, pelvic tilt, and waist bend angles.",
    "limb_placement": "Exact positioning of arms and legs.",
    "hands_and_fingers": "CRITICAL: For every visible hand, describe the grip, how many fingers are visible, and interaction with surfaces (e.g., 'fingers pressing into hip').",
    "head_and_gaze": "Head tilt angle and exact eye line direction.",
    "facial_expression": "Micro-expressions, mouth tension, eyebrow position, and overall emotional read."
  },
  "attire_mechanics": {
    "garments": "Detailed list of clothing items.",
    "fit_and_physics": "How the fabric reacts to the pose (e.g., 'skirt riding up on thigh', 'shirt stretching across bust', 'waistband digging slightly into skin')."
  },
  "environment_and_depth": {
    "background_elements": "List distinct objects to anchor depth.",
    "surface_interactions": "How the subject contacts the environment (e.g., 'leaning heavily on a scratched wooden rail')."
  },
  "image_texture": {
    "quality_defects": "Film grain, motion blur, ISO noise, lens flares.",
    "camera_characteristics": "Focal length feel, depth of field."
  }
}
`;

// Helper to extract MIME type and data from Base64 Data URI
const parseDataUrl = (dataUrl) => {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid image data format");
  return { mimeType: matches[1], data: matches[2] };
};

// Helper to parse JSON with recovery, or return raw text
const parseJSONWithRecovery = (text) => {
  try {
    return JSON.parse(text);
  } catch (parseError) {
    console.warn("JSON parse failed, attempting recovery:", parseError.message);
    // Clean markdown code blocks
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // Try finding valid JSON bounds
    const firstOpen = cleaned.indexOf('{');
    const lastClose = cleaned.lastIndexOf('}');

    if (firstOpen !== -1 && lastClose !== -1) {
      cleaned = cleaned.substring(firstOpen, lastClose + 1);
    }

    try {
      return JSON.parse(cleaned);
    } catch (e) {
      console.log("JSON Recovery failed. Returning raw text.", e);
      // Return raw text structure if not JSON (e.g. INI output)
      return { raw_output: text };
    }
  }
};

/**
 * Orchestrates the "Visual Architect" analysis.
 * 
 * @param {string} sourceImageBase64 - The input image from Frame 0.
 * @param {string} systemInstruction - The custom Gem Prompt.
 * @param {string} modelId - The Gemini model to use.
 */
export const analyzeImageVisualArchitect = async (
  sourceImageBase64,
  systemInstruction = null,
  modelId = 'gemini-2.0-flash'
) => {
  const apiKey = useAppStore.getState().apiKey;
  if (!apiKey) throw new Error("API Key missing");

  if (!systemInstruction || !systemInstruction.trim()) {
    throw new Error("No system instruction provided");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelId,
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE }
    ]
  });

  const { mimeType, data } = parseDataUrl(sourceImageBase64);

  try {
    const result = await model.generateContent([
      systemInstruction,
      { inlineData: { mimeType, data } }
    ]);

    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("No response from Gemini");

    return parseJSONWithRecovery(text);

  } catch (error) {
    console.error("Visual Architect Error:", error);
    throw error;
  }
};
