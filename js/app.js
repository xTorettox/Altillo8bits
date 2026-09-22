/**
 * ==========================================================================
 * EL ALTILLO 8-BITS — MAIN APPLICATION CONTROLLER
 * ==========================================================================
 * Coordinates console shelf, Google Drive discovery, and game launching.
 */

class AltilloApp {
    constructor() {
        this.activeSystem = 'nes';
        this.currentCatalog = [];
    }

    async init() {
        console.log("🎮 Inicializando El Altillo 8-Bits...");

        // Escuchar cambios de autenticación
        window.AltilloDrive.onStatusChange((status, data) => {
            if (status === 'AUTH_SUCCESS') {
                this.loadCatalogForSystem(this.activeSystem);
                if (window.AltilloUI) {
                    window.AltilloUI.showToast('¡Google Drive conectado! Cargando tus cartuchos...', 'success');
                    window.AltilloUI.playRetroSound('coin');
                }
            } else if (status === 'AUTH_ERROR') {
                if (window.AltilloUI) {
                    window.AltilloUI.showToast('No se pudo autenticar con Google.', 'error');
                    window.AltilloUI.playRetroSound('error');
                }
            } else if (status === 'AUTH_DISCONNECTED') {
                this.loadCatalogForSystem(this.activeSystem);
                if (window.AltilloUI) {
                    window.AltilloUI.showToast('Google Drive desconectado.', 'info');
                    window.AltilloUI.playRetroSound('select');
                }
            }
        });

        // Intentar conexión silenciosa
        window.AltilloDrive.autoConnectSilent();

        // 1. Configurar botones del estante de consolas
        this.setupConsoleShelf();

        // 2. Configurar buscador en tiempo real
        this.setupSearch();

        // 3. Configurar carga de archivo local desde la PC (Drag & Drop)
        this.setupFileUpload();

        // 4. Configurar modal de Netplay
        this.setupNetplayModal();

        // 5. Cargar catálogo inicial (NES)
        this.loadCatalogForSystem('nes');
    }

    // Configuración del Estante de Consolas
    setupConsoleShelf() {
        const buttons = document.querySelectorAll('.console-cartridge-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                window.AltilloUI.playRetroSound('select');
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const core = btn.dataset.core;
                this.activeSystem = core;
                window.AltilloEmulator.setCore(core);

                const titleEl = document.getElementById('active-console-title');
                if (titleEl) {
                    titleEl.innerText = btn.querySelector('span:nth-child(2)').innerText;
                }

                this.loadCatalogForSystem(core);
            });
        });
    }

    // Cargar y renderizar catálogo de juegos
    async loadCatalogForSystem(core) {
        const grid = document.getElementById('catalog-roms-grid');
        if (!grid) return;

        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 25px; color: #ffd54f; font-size: 8px;">
                <span class="latido" style="display:inline-block;">📦</span> Hurgando en el baúl del altillo...
            </div>
        `;

        try {
            const games = await window.AltilloDrive.fetchCatalogForSystem(core);
            this.currentCatalog = games;
            this.renderCatalog(games);
        } catch (e) {
            console.error("Error loading games:", e);
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #ff5252; font-size: 8px;">
                    Error al cargar los cartuchos.
                </div>
            `;
        }
    }

    // Renderizar tarjetas de juegos en el grid
    renderCatalog(games) {
        const grid = document.getElementById('catalog-roms-grid');
        if (!grid) return;

        grid.innerHTML = '';

        // Si NO está autenticado en Google Drive, mostrar botón de conexión en el baúl
        if (!window.AltilloDrive.isAuthenticated()) {
            const authBanner = document.createElement('div');
            authBanner.style.gridColumn = '1 / -1';
            authBanner.style.textAlign = 'center';
            authBanner.style.padding = '14px';
            authBanner.style.marginBottom = '10px';
            authBanner.style.background = '#27160c';
            authBanner.style.border = '2px dashed #ffca28';
            authBanner.style.borderRadius = '6px';

            authBanner.innerHTML = `
                <div style="font-size: 8px; color: #ffe082; margin-bottom: 8px;">
                    ☁️ Conectá tu Google Drive para cargar tus ROMs de <strong>/Altillo8bits/ROMs/${this.activeSystem.toUpperCase()}/</strong>
                </div>
                <button id="btn-login-drive-inline" type="button" class="button -success" style="font-size: 8px; padding: 6px 14px;">
                    🔑 CONECTAR GOOGLE DRIVE
                </button>
            `;

            authBanner.querySelector('#btn-login-drive-inline').addEventListener('click', async () => {
                window.AltilloUI.playRetroSound('select');
                try {
                    await window.AltilloDrive.signIn();
                } catch (e) {
                    console.warn("User cancelled or error in sign-in:", e);
                }
            });

            grid.appendChild(authBanner);
        } else {
            // Banner de estado conectado
            const connectedBadge = document.createElement('div');
            connectedBadge.style.gridColumn = '1 / -1';
            connectedBadge.style.display = 'flex';
            connectedBadge.style.justifyContent = 'space-between';
            connectedBadge.style.alignItems = 'center';
            connectedBadge.style.padding = '8px 12px';
            connectedBadge.style.marginBottom = '10px';
            connectedBadge.style.background = 'rgba(0, 230, 118, 0.1)';
            connectedBadge.style.border = '1px solid #00e676';
            connectedBadge.style.borderRadius = '6px';
            connectedBadge.style.fontSize = '8px';

            connectedBadge.innerHTML = `
                <span style="color: #69f0ae;">☁️ Google Drive Conectado (/Altillo8bits/ROMs/${this.activeSystem.toUpperCase()}/)</span>
                <button id="btn-disconnect-drive" type="button" class="button -error" style="font-size: 6px; padding: 3px 8px;">
                    Desconectar
                </button>
            `;

            connectedBadge.querySelector('#btn-disconnect-drive').addEventListener('click', () => {
                window.AltilloDrive.disconnect();
            });

            grid.appendChild(connectedBadge);
        }

        if (!games || games.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.style.gridColumn = '1 / -1';
            emptyMsg.style.textAlign = 'center';
            emptyMsg.style.padding = '25px 10px';
            emptyMsg.style.color = '#b0bec5';
            emptyMsg.style.fontSize = '8px';
            emptyMsg.style.lineHeight = '2';

            const sysName = window.AltilloDrive.getSystemFolderName(this.activeSystem);
            emptyMsg.innerHTML = `
                📦 No hay cartuchos en este estante todavía.<br>
                <span style="color:#ffd54f;">Subí tus juegos a <strong>/Altillo8bits/ROMs/${sysName}/</strong> en tu Drive o arrastrá un archivo propio en la pestaña "Cargar Cartucho".</span>
            `;
            grid.appendChild(emptyMsg);
            return;
        }

        games.forEach(game => {
            const card = document.createElement('div');
            card.className = 'rom-item-card';

            const sourceBadge = game.source === 'gdrive' ? '☁️ DRIVE' : '💾 LOCAL';

            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <span>📼</span>
                    <span style="font-weight: bold;">${game.name}</span>
                </div>
                <span class="rom-save-tag">${sourceBadge}</span>
            `;

            card.addEventListener('click', async () => {
                window.AltilloUI.playRetroSound('coin');
                window.AltilloUI.showSection('seccionEmulador');

                try {
                    if (game.source === 'gdrive') {
                        const blob = await window.AltilloDrive.downloadRomBlob(game);
                        window.AltilloEmulator.launchGame({
                            romData: blob,
                            core: game.system || this.activeSystem,
                            gameName: game.name,
                            fileName: game.fileName || game.name,
                            isBlob: true
                        });
                    } else {
                        window.AltilloEmulator.launchGame({
                            romData: game.url,
                            core: game.system || this.activeSystem,
                            gameName: game.name,
                            fileName: game.fileName || game.name,
                            isBlob: false
                        });
                    }
                } catch(err) {
                    console.error("Error launching game:", err);
                    window.AltilloUI.showToast("No se pudo iniciar el juego.", "error");
                }
            });

            grid.appendChild(card);
        });
    }

    // Buscador en tiempo real de juegos
    setupSearch() {
        const searchInput = document.getElementById('rom-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                if (!query) {
                    this.renderCatalog(this.currentCatalog);
                    return;
                }
                const filtered = this.currentCatalog.filter(g => g.name.toLowerCase().includes(query));
                this.renderCatalog(filtered);
            });
        }
    }

    // Subida y arrastre de ROM local desde la PC
    setupFileUpload() {
        const fileInput = document.getElementById('local-rom-file-input');
        const dropZone = document.getElementById('rom-drop-zone');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.loadRomFromFile(e.target.files[0]);
                }
            });
        }

        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = '#00e676';
            });
            dropZone.addEventListener('dragleave', () => {
                dropZone.style.borderColor = '#ffca28';
            });
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = '#ffca28';
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    this.loadRomFromFile(e.dataTransfer.files[0]);
                }
            });
        }
    }

    loadRomFromFile(file) {
        window.AltilloUI.playRetroSound('coin');
        const fileName = file.name;
        const ext = fileName.split('.').pop().toLowerCase();
        
        let core = this.activeSystem;
        if (ext === 'nes') core = 'nes';
        else if (ext === 'smc' || ext === 'sfc') core = 'snes';
        else if (ext === 'md' || ext === 'gen' || ext === 'bin') core = 'segaMD';
        else if (ext === 'gb' || ext === 'gbc') core = 'gb';
        else if (ext === 'gba') core = 'gba';
        else if (ext === 'z64' || ext === 'n64' || ext === 'v64') core = 'n64';
        else if (ext === 'iso' || ext === 'cue' || ext === 'chd' || ext === 'pbp') core = 'psx';

        window.AltilloUI.showSection('seccionEmulador');
        const gameName = fileName.replace(/\.[^/.]+$/, "");

        window.AltilloEmulator.launchGame({
            romData: file,
            core: core,
            gameName: gameName,
            fileName: fileName,
            isBlob: true
        });
    }

    // Jugar ROM aleatorio
    async playRandomGame() {
        window.AltilloUI.playRetroSound('coin');
        if (this.currentCatalog.length > 0) {
            const randomGame = this.currentCatalog[Math.floor(Math.random() * this.currentCatalog.length)];
            window.AltilloUI.showSection('seccionEmulador');
            
            if (randomGame.source === 'gdrive') {
                const blob = await window.AltilloDrive.downloadRomBlob(randomGame);
                window.AltilloEmulator.launchGame({
                    romData: blob,
                    core: randomGame.system || this.activeSystem,
                    gameName: randomGame.name,
                    fileName: randomGame.fileName || randomGame.name,
                    isBlob: true
                });
            } else {
                window.AltilloEmulator.launchGame({
                    romData: randomGame.url,
                    core: randomGame.system || this.activeSystem,
                    gameName: randomGame.name,
                    fileName: randomGame.fileName || randomGame.name,
                    isBlob: false
                });
            }
        }
    }

    // Modal de Netplay
    setupNetplayModal() {
        const saveNetplayBtn = document.getElementById('btn-save-netplay');
        if (saveNetplayBtn) {
            saveNetplayBtn.addEventListener('click', () => {
                const roomInput = document.getElementById('netplay-room-input');
                const enabledCheck = document.getElementById('netplay-enable-check');
                
                if (window.AltilloEmulator) {
                    window.AltilloEmulator.netplay.enabled = enabledCheck ? enabledCheck.checked : false;
                    window.AltilloEmulator.netplay.roomId = roomInput ? roomInput.value.trim() : '';
                    window.AltilloUI.showToast(
                        window.AltilloEmulator.netplay.enabled 
                            ? `Sala Netplay activa: ${window.AltilloEmulator.netplay.roomId}` 
                            : 'Multijugador desactivado.',
                        'info'
                    );
                }
                window.AltilloUI.closeModal('modal-netplay');
            });
        }
    }
}

// Inicializar en DOMContentLoaded
window.AltilloApp = new AltilloApp();
document.addEventListener('DOMContentLoaded', () => {
    window.AltilloApp.init();
});
