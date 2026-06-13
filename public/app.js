/**
 * Frontend Controller Config & Event Mapping
 * Universal Media Extractor Architecture
 */

// Replace with your production URL after deploying your backend Vercel script
const CONFIG = {
    API_ENDPOINT: "https://your-vercel-project-name.vercel.app/api"
};

document.addEventListener('DOMContentLoaded', () => {
    const DOM = {
        form: document.getElementById('downloadForm'),
        input: document.getElementById('videoUrl'),
        submitBtn: document.getElementById('submitBtn'),
        loader: document.getElementById('loadingState'),
        errorPanel: document.getElementById('errorState'),
        errorMsg: document.getElementById('errorMessage'),
        resultPanel: document.getElementById('resultState'),
        thumb: document.getElementById('resThumbnail'),
        title: document.getElementById('resTitle'),
        provider: document.getElementById('resProvider'),
        downloadBtn: document.getElementById('resDownloadLink')
    };

    DOM.form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const targetedMediaUrl = DOM.input.value.trim();

        // Standardize UI Component Reset State
        DOM.errorPanel.classList.add('hidden');
        DOM.resultPanel.classList.add('hidden');
        DOM.loader.classList.remove('hidden');
        DOM.submitBtn.disabled = true;
        DOM.submitBtn.classList.add('opacity-40', 'cursor-not-allowed');

        try {
            // Dispatch query extraction request across CORS pipeline boundary
            const executionEndpoint = `${CONFIG.API_ENDPOINT}?url=${encodeURIComponent(targetedMediaUrl)}`;
            const response = await fetch(executionEndpoint, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            const payload = await response.json();

            if (!response.ok || !payload.success) {
                throw new Error(payload.detail || "Server failed to unpack data layers for this object payload.");
            }

            // Bind incoming network metrics payload schema to DOM
            DOM.title.textContent = payload.title || "Target File Object";
            DOM.provider.textContent = payload.provider || "CDN Source";
            DOM.thumb.src = payload.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400";
            DOM.downloadBtn.href = payload.download_url;

            // Trigger visual representation display modifications
            DOM.resultPanel.classList.remove('hidden');

        } catch (error) {
            // Graceful error state interface switching
            DOM.errorMsg.textContent = error.message || "A network routing interruption occurred.";
            DOM.errorPanel.classList.remove('hidden');
        } finally {
            // Restore event parsing capability
            DOM.loader.classList.add('hidden');
            DOM.submitBtn.disabled = false;
            DOM.submitBtn.classList.remove('opacity-40', 'cursor-not-allowed');
        }
    });
});