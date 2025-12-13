import { create } from 'zustand';
import { generateImage as generateImageService } from '../services/imageGenerationService';

const useAppStore = create((set, get) => ({
    // Global App State
    apiKey: sessionStorage.getItem('gem_api_key') || null,
    wavespeedApiKey: sessionStorage.getItem('wavespeed_api_key') || '',
    imageProvider: 'google', // 'google' | 'wavespeed'
    generationMode: 'prompt', // 'prompt' | 'image'
    isAnalyzing: false,
    aspectRatio: '9:16',
    resolution: '2k', // '2k' | '4k'
    activeFrameCount: 4,

    // Library State
    library: JSON.parse(localStorage.getItem('gem_library') || '[]'),

    addToLibrary: (item) => {
        const state = get();
        if (state.library.length >= 20) {
            alert("Library is full (Max 20 items). Please delete some items first.");
            return false;
        }
        const newItem = { ...item, id: Date.now().toString(), date: Date.now() };
        const newLibrary = [newItem, ...state.library];
        localStorage.setItem('gem_library', JSON.stringify(newLibrary));
        set({ library: newLibrary });
        return true;
    },

    removeFromLibrary: (id) => {
        const state = get();
        const newLibrary = state.library.filter(item => item.id !== id);
        localStorage.setItem('gem_library', JSON.stringify(newLibrary));
        set({ library: newLibrary });
    },

    setApiKey: (key) => {
        if (key) {
            sessionStorage.setItem('gem_api_key', key);
        } else {
            sessionStorage.removeItem('gem_api_key');
        }
        set({ apiKey: key });
    },

    setWavespeedApiKey: (key) => {
        sessionStorage.setItem('wavespeed_api_key', key);
        set({ wavespeedApiKey: key });
    },

    setImageProvider: (provider) => set({ imageProvider: provider }),

    setGenerationMode: (mode) => set({ generationMode: mode }),

    // Frame State
    // Frame 0 is special (Image Upload / Text Input toggle)
    // Frames 1-4 are Result frames
    frames: Array(5).fill(null).map((_, i) => ({
        id: i,
        type: i === 0 ? 'input' : 'output',
        mode: i === 0 ? 'image' : 'prompt', // 'image' | 'text' for input; 'prompt' | 'gem' for output
        isFlipped: false,
        content: {
            inputImage: null,  // URL or File object
            inputText: '',
            prompt: '',        // The prompt used for generation
            gemId: null,      // If using a GEM
            outputImage: null, // The generated image URL
        },
        status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
    })),

    // Actions
    setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

    setActiveFrameCount: (count) => set({ activeFrameCount: count }),

    setAspectRatio: (aspectRatio) => set({ aspectRatio }),

    setResolution: (resolution) => set({ resolution }),

    toggleFrameFlip: (id) => set((state) => ({
        frames: state.frames.map(f =>
            f.id === id ? { ...f, isFlipped: !f.isFlipped } : f
        )
    })),

    // For Frame 0 toggle between Image Upload and Text Input
    toggleInputMode: () => set((state) => ({
        frames: state.frames.map(f =>
            f.id === 0 ? { ...f, mode: f.mode === 'image' ? 'text' : 'image' } : f
        )
    })),

    updateFrameContent: (id, contentUpdates) => set((state) => ({
        frames: state.frames.map(f =>
            f.id === id ? { ...f, content: { ...f.content, ...contentUpdates } } : f
        )
    })),

    resetFrame: (id) => set((state) => ({
        frames: state.frames.map(f =>
            f.id === id ? {
                ...f,
                isFlipped: false,
                content: { ...f.content, outputImage: null, prompt: '' }, // Keep input inputs? "reset each fram individually so the user can replace one gem"
                status: 'idle'
            } : f
        )
    })),

    resetAll: () => set((state) => ({
        frames: state.frames.map(f => ({
            ...f,
            isFlipped: false,
            content: {
                inputImage: null,
                inputText: '',
                prompt: '',
                gemId: null,
                outputImage: null
            },
            status: 'idle'
        }))
    })),

    triggerAnalyze: async () => {
        // Deprecated
    },

    // Action to generate image from a specific frame's prompt result
    generateImage: async (frameId) => {
        const state = get();
        const { frames, apiKey, aspectRatio, resolution } = state;
        const frame = frames.find(f => f.id === frameId);

        if (!frame || !frame.content.promptJson) return;

        console.log(`Generating Image for Frame ${frameId}...`);

        // Update status for UI feedback
        set((current) => ({
            frames: current.frames.map(f => f.id === frameId ? { ...f, status: 'loading_image' } : f)
        }));

        // Determine Prompt Text
        let promptText = "";
        try {
            const parsed = JSON.parse(frame.content.promptJson);
            if (parsed.raw_output) {
                promptText = parsed.raw_output;
            } else if (parsed.prompt) {
                promptText = parsed.prompt;
            } else if (parsed.image_prompt) {
                promptText = parsed.image_prompt;
            } else {
                // If it's a generic JSON, looks like we should just use the stringified version or a default field?
                // Let's try stringifying if no obvious field
                promptText = JSON.stringify(parsed);
            }
        } catch (e) {
            // If parse fails (shouldn't if promptJson is valid json string), use raw string
            promptText = frame.content.promptJson;
        }

        try {
            const result = await generateImageService({
                apiKey,
                prompt: promptText,
                aspectRatio,
                resolution
            });

            if (result.error) throw new Error(result.error);

            const imageUrl = result.url || `data:image/png;base64,${result.b64_json}`;

            set((current) => ({
                frames: current.frames.map(f => f.id === frameId ? {
                    ...f,
                    status: 'success', // Restore status
                    content: {
                        ...f.content,
                        outputImage: imageUrl
                    }
                } : f)
            }));

        } catch (error) {
            console.error("Image Gen Error:", error);
            alert(`Image Generation Failed: ${error.message}`);
            set((current) => ({
                frames: current.frames.map(f => f.id === frameId ? { ...f, status: 'success' } : f) // Reset status on error
            }));
        }
    },

    generatePrompts: async () => {
        const state = get();
        const { frames, apiKey, activeFrameCount } = state;
        const inputFrame = frames.find(f => f.id === 0);

        if (!apiKey) {
            console.error("No API Key");
            alert("No API Key found. Please refresh and enter your key.");
            return;
        }

        // Validate Input Image
        let inputImage = inputFrame.content.inputImage;
        if (!inputImage && inputFrame.mode === 'image') {
            console.error("No Input Image in Frame 0");
            alert("Please upload an image to the INPUT SOURCE frame (leftmost) first.");
            return;
        }

        // Validate at least one active frame has a prompt
        const activeFrames = frames.filter(f => f.id !== 0 && f.id <= activeFrameCount);
        const hasPrompt = activeFrames.some(f => f.content.prompt && f.content.prompt.trim().length > 0);

        if (!hasPrompt) {
            alert("Please fill in at least one comparison box text to analyze.");
            return;
        }

        console.log("Starting Analysis...");
        set({ isAnalyzing: true });

        // 1. Set Loading States for active frames WITH PROMPTS
        set((current) => ({
            frames: current.frames.map(f => {
                if (f.id !== 0 && f.id <= activeFrameCount && f.content.prompt) {
                    return {
                        ...f,
                        isFlipped: true,
                        status: 'loading',
                        content: { ...f.content, outputImage: null, promptJson: null }
                    };
                }
                return f;
            })
        }));

        try {
            // Import dynamically
            const { analyzeImageVisualArchitect } = await import('../services/visualArchitect');

            // 2. Parallel Analysis Requests
            const analysisPromises = frames.map(async (f) => {
                if (f.id === 0) return null; // Skip input frame
                if (f.id > activeFrameCount) return null; // Skip disabled frames

                const systemInstruction = f.content.prompt || "";
                if (!systemInstruction.trim()) return null; // Skip frames with empty prompts

                try {
                    console.log(`Analyzing Frame ${f.id} with prompt length: ${systemInstruction.length}`);
                    const resultJson = await analyzeImageVisualArchitect(
                        inputImage,
                        systemInstruction
                    );

                    return {
                        id: f.id,
                        success: true,
                        data: JSON.stringify(resultJson, null, 2)
                    };
                } catch (err) {
                    console.error(`Frame ${f.id} Failed:`, err);
                    return {
                        id: f.id,
                        success: false,
                        error: err.message || "Analysis Failed"
                    };
                }
            });

            const results = await Promise.all(analysisPromises);

            // 3. Update State with Results
            set((current) => ({
                isAnalyzing: false,
                frames: current.frames.map(f => {
                    const res = results.find(r => r && r.id === f.id);
                    if (res) {
                        if (res.success) {
                            const isImageMode = get().generationMode === 'image';
                            return {
                                ...f,
                                status: isImageMode ? 'loading_image' : 'success',
                                content: {
                                    ...f.content,
                                    promptJson: res.data
                                }
                            };
                        } else {
                            return {
                                ...f,
                                status: 'error',
                                content: {
                                    ...f.content,
                                    promptJson: JSON.stringify({ error: res.error }, null, 2)
                                }
                            };
                        }
                    }
                    return f;
                })
            }));

            // 4. Check for Auto-Generation (Image Mode)
            const currentMode = get().generationMode;
            if (currentMode === 'image') {
                results.forEach(res => {
                    if (res && res.success) {
                        // Trigger image generation for successful frames
                        get().generateImage(res.id);
                    }
                });
            }

        } catch (globalErr) {
            console.error("Global Analysis Error:", globalErr);
            set({ isAnalyzing: false });
        }
    }
}));

export default useAppStore;
