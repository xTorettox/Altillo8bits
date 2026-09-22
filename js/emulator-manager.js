/**
 * ==========================================================================
 * EL ALTILLO 8-BITS — EMULATOR CONTROLLER WITH ISOLATED IFRAME RUNTIME
 * ==========================================================================
 * Uses an isolated <iframe> sandbox to guarantee 100% clean termination,
 * zero parallel game execution, full audio & WebAssembly memory release on "Apagar".
 */

class AltilloEmulatorManager {
    constructor() {
        this.containerId = '#emulator-container';
        this.currentCore = 'nes';
        this.currentGameName = '';
        this.currentRomBlobUrl = null;
        this.currentSaveBlobUrl = null;
        this.isPlaying = false;
        this.crtFilterActive = true;

        this.coreMap = {
            'nes': { id: 'nes', label: 'Nintendo NES (8-Bit)', defaultExt: '.nes' },
            'snes': { id: 'snes', label: 'Super Nintendo (16-Bit)', defaultExt: '.sfc' },
            'segaMD': { id: 'segaMD', label: 'Sega Mega Drive / Genesis', defaultExt: '.md' },
            'gb': { id: 'gb', label: 'Game Boy / Color', defaultExt: '.gb' },
            'gba': { id: 'gba', label: 'Game Boy Advance (32-Bit)', defaultExt: '.gba' },
            'n64': { id: 'n64', label: 'Nintendo 64', defaultExt: '.z64' },
            'psx': { id: 'psx', label: 'Sony PlayStation 1', defaultExt: '.iso' }
        };

        // Escuchar mensajes de guardado provenientes del iframe aislado
        window.addEventListener('message', (event) => {
            this.handleIframeMessage(event);
        });

        // Interceptar teclas en la ventana principal para evitar scroll al jugar
        window.addEventListener('keydown', (e) => {
            const target = e.target;
            const tag = target ? (target.tagName || '').toLowerCase() : '';
            if (tag === 'input' || tag === 'textarea' || tag === 'select' || (target && target.isContentEditable)) {
                return; // Permitir escribir normalmente en inputs
            }

            if (this.isPlaying) {
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' ', 'PageUp', 'PageDown'].includes(e.key) ||
                    [32, 37, 38, 39, 40, 33, 34].includes(e.keyCode)) {
                    e.preventDefault();
                    
                    // Asegurar que el foco esté dentro del iframe del juego
                    const iframe = document.getElementById('emulator-iframe');
                    if (iframe && iframe.contentWindow && document.activeElement !== iframe) {
                        try { iframe.contentWindow.focus(); } catch(err) {}
                    }
                }
            }
        }, { passive: false });

        // Auto-enfocar iframe al hacer click en el marco o pantalla de la TV
        document.addEventListener('click', (e) => {
            if (this.isPlaying && e.target.closest('.tv-cabinet, .crt-bezel, #emulator-container')) {
                const iframe = document.getElementById('emulator-iframe');
                if (iframe && iframe.contentWindow) {
                    try { iframe.contentWindow.focus(); } catch(err) {}
                }
            }
        });
    }

    setCore(coreId) {
        if (this.coreMap[coreId]) {
            this.currentCore = coreId;
            const badge = document.getElementById('tv-current-system');
            if (badge) {
                badge.innerText = this.coreMap[coreId].label;
            }
        }
    }

    getCoreInfo(coreId) {
        return this.coreMap[coreId || this.currentCore] || this.coreMap['nes'];
    }

    // Manejador de eventos de guardado desde el iframe
    async handleIframeMessage(event) {
        if (!event.data || !event.data.type) return;

        const powerLed = document.getElementById('tv-power-led');

        if (event.data.type === 'ALTILLO_SAVE_STATE') {
            console.log("💾 Save State recibido del iframe:", event.data.gameName);
            if (powerLed) powerLed.className = 'power-led saving';
            if (window.AltilloUI) window.AltilloUI.showToast(`💾 Guardando estado en la nube...`, 'info');

            const ok = await window.AltilloDrive.uploadSaveFile(event.data.gameName, event.data.state, true);
            if (powerLed) powerLed.className = 'power-led on';
            if (ok && window.AltilloUI) window.AltilloUI.playRetroSound('save');
        }

        if (event.data.type === 'ALTILLO_SAVE_SAVE') {
            console.log("💾 Memoria virtual (.srm) recibida del iframe:", event.data.gameName);
            if (powerLed) powerLed.className = 'power-led saving';
            if (window.AltilloUI) window.AltilloUI.showToast(`💾 Guardando memoria virtual...`, 'info');

            const ok = await window.AltilloDrive.uploadSaveFile(event.data.gameName, event.data.save, false);
            if (powerLed) powerLed.className = 'power-led on';
            if (ok && window.AltilloUI) window.AltilloUI.playRetroSound('save');
        }
    }

    // Cargar y ejecutar un juego matando cualquier instancia previa
    async launchGame({ romData, core, gameName, fileName, isBlob = false }) {
        // 1. Matar completamente cualquier juego previo
        this.stopGame();

        this.currentCore = core || this.currentCore;
        this.setCore(this.currentCore);
        const coreInfo = this.getCoreInfo(this.currentCore);

        // Determinar nombre legible y nombre completo de archivo con extensión
        const rawName = (fileName || gameName || 'Juego Altillo').trim();
        const baseName = rawName.replace(/\.[^/.]+$/, "");
        this.currentGameName = baseName;

        // Garantizar extensión para el core (fundamental para PSX / PCSX-ReARMed)
        let resolvedFileName = fileName || rawName;
        if (!resolvedFileName.includes('.')) {
            resolvedFileName = `${baseName}${coreInfo.defaultExt || '.nes'}`;
        }

        const container = document.querySelector(this.containerId);
        if (!container) return;

        // Mostrar pantalla de carga
        container.innerHTML = `
            <div class="crt-standby-screen">
                <div class="crt-standby-logo">EL ALTILLO 8-BITS</div>
                <div class="latido" style="font-size: 28px;">🎮</div>
                <div class="crt-standby-msg" id="emu-loading-msg">
                    Insertando cartucho...<br>
                    <span style="color:#ffd54f;">${this.currentGameName}</span>
                </div>
            </div>
        `;

        const powerLed = document.getElementById('tv-power-led');
        if (powerLed) powerLed.className = 'power-led on';

        try {
            // 2. Preparar Blob URL si es necesario
            let finalRomUrl = '';
            if (romData instanceof Blob) {
                this.currentRomBlobUrl = URL.createObjectURL(romData);
                finalRomUrl = this.currentRomBlobUrl;
            } else if (typeof romData === 'string') {
                finalRomUrl = romData;
            } else {
                throw new Error("Formato de ROM no reconocido.");
            }

            // 3. Buscar Save previo en Google Drive / LocalStorage
            let saveUrlParam = '';
            try {
                const saveResult = await window.AltilloDrive.findSaveFile(this.currentGameName, true);
                if (saveResult && saveResult.data) {
                    this.currentSaveBlobUrl = URL.createObjectURL(saveResult.data);
                    saveUrlParam = this.currentSaveBlobUrl;
                    if (window.AltilloUI) {
                        window.AltilloUI.showToast(`Partida previa restaurada!`, 'success');
                    }
                }
            } catch (saveErr) {
                console.warn("No se pudo cargar save previo:", saveErr);
            }

            // 4. Crear un nuevo iframe aislado para ejecutar el emulador
            container.innerHTML = '';
            const iframe = document.createElement('iframe');
            iframe.id = 'emulator-iframe';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.minHeight = '440px';
            iframe.style.border = 'none';
            iframe.setAttribute('allow', 'autoplay; gamepad *');
            iframe.setAttribute('tabindex', '0');

            // Construir URL con parámetros completos
            const queryParams = new URLSearchParams({
                core: this.currentCore,
                romUrl: finalRomUrl,
                gameName: this.currentGameName,
                gameFileName: resolvedFileName
            });

            if (saveUrlParam) {
                queryParams.set('saveUrl', saveUrlParam);
            }

            iframe.src = `player.html?${queryParams.toString()}`;
            container.appendChild(iframe);

            // Dar foco al iframe para que los controles funcionen inmediatamente
            iframe.onload = () => {
                try {
                    iframe.contentWindow.focus();
                } catch(e) {}
            };

            this.isPlaying = true;

        } catch (err) {
            console.error("Error al iniciar juego:", err);
            this.stopGame();
            container.innerHTML = `
                <div class="crt-standby-screen">
                    <div class="crt-standby-logo" style="color:#ff1744;">ERROR DE CARGA</div>
                    <div style="font-size: 20px;">💥</div>
                    <div class="crt-standby-msg" style="color:#ff8a80;">${err.message || 'No se pudo iniciar el cartucho.'}</div>
                </div>
            `;
        }
    }

    // MATAR EL EMULADOR Y LIBERAR RECURSOS (100% Limpio)
    stopGame() {
        // 1. Destruir y remover el iframe del DOM
        const existingIframe = document.getElementById('emulator-iframe');
        if (existingIframe) {
            existingIframe.src = 'about:blank';
            existingIframe.remove();
        }

        // 2. Liberar URLs de memoria Blob
        if (this.currentRomBlobUrl && this.currentRomBlobUrl.startsWith('blob:')) {
            URL.revokeObjectURL(this.currentRomBlobUrl);
            this.currentRomBlobUrl = null;
        }
        if (this.currentSaveBlobUrl && this.currentSaveBlobUrl.startsWith('blob:')) {
            URL.revokeObjectURL(this.currentSaveBlobUrl);
            this.currentSaveBlobUrl = null;
        }

        // 3. Restaurar pantalla de Standby
        const container = document.querySelector(this.containerId);
        if (container) {
            container.innerHTML = `
                <div class="crt-standby-screen">
                    <div class="crt-standby-logo">EL ALTILLO 8-BITS</div>
                    <div class="latido" style="font-size: 32px;">📺</div>
                    <div class="crt-standby-msg">
                        TELEVISOR EN ESPERA<br>
                        <span style="color:#ffd54f; font-size:8px;">Elegí un juego del baúl para encender</span>
                    </div>
                </div>
            `;
        }

        // 4. Apagar LED de Power
        const powerLed = document.getElementById('tv-power-led');
        if (powerLed) {
            powerLed.className = 'power-led';
        }

        this.isPlaying = false;
        if (window.AltilloUI) window.AltilloUI.playRetroSound('switch');
    }

    toggleCRT() {
        this.crtFilterActive = !this.crtFilterActive;
        const screenWrapper = document.querySelector('.crt-screen-wrapper');
        if (screenWrapper) {
            screenWrapper.classList.toggle('crt-active', this.crtFilterActive);
        }
        return this.crtFilterActive;
    }

    toggleFullscreen() {
        const container = document.querySelector('.crt-screen-wrapper');
        if (!container) return;

        if (!document.fullscreenElement) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
}

// Instancia global
window.AltilloEmulator = new AltilloEmulatorManager();
