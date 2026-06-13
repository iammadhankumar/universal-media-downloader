/**
 * Frontend Controller Config & Event Mapping
 * Universal Media Extractor Architecture
 */

// Replace with your production URL after deploying your backend Vercel script
const CONFIG = {
    API_ENDPOINT: "https://mk-mediafetch-pro.vercel.app/api"
};

document.addEventListener('DOMContentLoaded', () => {
    const DOM = {
        form: document.getElementById('downloadForm'),
        input: document.getElementById('videoUrl'),
        submitBtn: document.getElementById('submitBtn'),
        clearBtn: document.getElementById('clearBtn'),
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
            DOM.downloadBtn.href = payload.download_url;

            DOM.thumb.onerror = null;

            DOM.thumb.src = payload.thumbnail || "https://i.pinimg.com/1200x/fd/29/64/fd29649495d0d5d85a595570cc3ea9da.jpg";

            // FALLBACK ONLY IF THE LIVE MEDIA THUMBNAIL FAILS TO SHOW:
            DOM.thumb.onerror = function() {
                this.src = "https://i.pinimg.com/1200x/fd/29/64/fd29649495d0d5d85a595570cc3ea9da.jpg";
                this.onerror = null; // Prevents infinite loops if the backup image ever goes down
            };

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