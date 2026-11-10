// Course images are stored in the database as data URLs. To keep requests under the
// API's 4 MB body limit (Vercel Functions reject anything over 4.5 MB), images are
// resized and re-encoded as JPEG in the browser before upload.

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;

// Total size of all images in one save, as base64 text. Each image is sent once
// (the API derives the cover from the first image), leaving room for the other fields.
export const MAX_TOTAL_IMAGE_CHARS = 3 * 1024 * 1024;

export function compressImage(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext('2d');
            // White background so transparent PNGs don't turn black as JPEG
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error(`Could not read ${file.name}`));
        };
        img.src = url;
    });
}

export const totalImageChars = (images) => images.reduce((sum, src) => sum + (src?.length || 0), 0);
