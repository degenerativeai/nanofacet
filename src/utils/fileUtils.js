import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Downloads a single image from a URL or Base64 string.
 * @param {string} url - The image URL or Base64 string.
 * @param {string} filename - The filename to save as.
 */
export const downloadImage = async (url, filename) => {
    try {
        // If it's a data URI, we can convert it to a blob or just trigger download
        if (url.startsWith('data:')) {
            saveAs(url, filename);
        } else {
            // For external URLs, fetch as blob to enforce download
            const response = await fetch(url);
            const blob = await response.blob();
            saveAs(blob, filename);
        }
    } catch (error) {
        console.error("Download failed:", error);
        alert("Failed to download image. Security restrictions may prevent downloading from this source.");
    }
};

/**
 * Downloads multiple images as a ZIP file.
 * @param {Array<{url: string, filename: string}>} images - List of images to download.
 * @param {string} zipFilename - The name of the ZIP file.
 */
export const downloadImagesAsZip = async (images, zipFilename = 'images.zip') => {
    const zip = new JSZip();
    const folder = zip.folder("images");

    let successCount = 0;

    // Process all images
    await Promise.all(images.map(async (img) => {
        try {
            let data;
            if (img.url.startsWith('data:')) {
                // Remove header to get base64 data
                data = img.url.split(',')[1];
                folder.file(img.filename, data, { base64: true });
            } else {
                // Fetch external URL
                const response = await fetch(img.url);
                const blob = await response.blob();
                folder.file(img.filename, blob);
            }
            successCount++;
        } catch (err) {
            console.error(`Failed to add ${img.filename} to zip:`, err);
        }
    }));

    if (successCount === 0) {
        alert("No images could be downloaded.");
        return;
    }

    try {
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, zipFilename);
    } catch (err) {
        console.error("Failed to generate zip:", err);
        alert("Failed to create ZIP file.");
    }
};
