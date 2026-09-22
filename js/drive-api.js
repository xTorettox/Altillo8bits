/**
 * ==========================================================================
 * EL ALTILLO 8-BITS — GOOGLE DRIVE & RETRO CLOUD BRIDGE
 * ==========================================================================
 * Navigates Google Drive folder structure (Altillo8bits > ROMs > [NES, SNES, PSX, etc.]),
 * downloads ROM blobs to memory, and synchronizes Save States seamlessly.
 */

class AltilloDriveAPI {
    constructor() {
        this.CLIENT_ID_KEY = 'altillo_gdrive_client_id';
        this.DEFAULT_CLIENT_ID = '1016072395905-8n4gpb83be7d0m1eqaeqkvjpp0k68gr5.apps.googleusercontent.com';
        this.clientId = localStorage.getItem(this.CLIENT_ID_KEY) || this.DEFAULT_CLIENT_ID;
        
        this.tokenClient = null;
        this.accessToken = localStorage.getItem('altillo_gdrive_token') || null;
        this.tokenExpiresAt = parseInt(localStorage.getItem('altillo_gdrive_expires') || '0', 10);
        
        // Cache de carpetas encontradas
        this.folderCache = {
            rootId: null,   // 'Altillo8bits'
            romsId: null,   // 'ROMs'
            savesId: null,  // 'Saves'
            systems: {}     // 'PSX', 'NES', 'SNES', etc.
        };

        this.scopes = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file';
        this.listeners = [];
        this.isConnecting = false;

        this.setupSilentRefresh();
    }

    setClientId(newClientId) {
        this.clientId = (newClientId || this.DEFAULT_CLIENT_ID).trim();
        localStorage.setItem(this.CLIENT_ID_KEY, this.clientId);
        this.tokenClient = null;
    }

    getClientId() {
        return this.clientId;
    }

    isAuthenticated() {
        return !!(this.accessToken && Date.now() < this.tokenExpiresAt);
    }

    isPreviouslyConnected() {
        return localStorage.getItem('altillo_gdrive_connected') === 'true';
    }

    onStatusChange(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
        }
    }

    notifyStatus(status, details = {}) {
        this.listeners.forEach(cb => {
            try { cb(status, details); } catch(e) { console.error("Error in status callback", e); }
        });
    }

    // Esperar activamente a que el SDK de Google termine de cargarse
    async waitForGis(timeoutMs = 8000) {
        if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
            return true;
        }

        const startTime = Date.now();
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
                    clearInterval(checkInterval);
                    resolve(true);
                } else if (Date.now() - startTime >= timeoutMs) {
                    clearInterval(checkInterval);
                    resolve(false);
                }
            }, 200);
        });
    }

    // Inicializar Google Identity Services
    async initGIS() {
        const isGisReady = await this.waitForGis();
        if (!isGisReady) {
            console.warn("Google Identity Services SDK no disponible todavía.");
            return false;
        }

        return new Promise((resolve) => {
            try {
                this.tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: this.clientId,
                    scope: this.scopes,
                    callback: (response) => {
                        this.isConnecting = false;
                        if (response.error) {
                            console.warn("GIS auth error response:", response);
                            // Si el error silencioso fue por requerir interacción, no alertar al usuario
                            if (response.error !== 'interaction_required') {
                                this.notifyStatus('AUTH_ERROR', { error: response });
                            }
                            return;
                        }

                        this.accessToken = response.access_token;
                        const expiresIn = (parseInt(response.expires_in, 10) || 3600) - 60;
                        this.tokenExpiresAt = Date.now() + (expiresIn * 1000);

                        localStorage.setItem('altillo_gdrive_token', this.accessToken);
                        localStorage.setItem('altillo_gdrive_expires', this.tokenExpiresAt.toString());
                        localStorage.setItem('altillo_gdrive_connected', 'true');

                        console.log("⭐ Autenticado con éxito en Google Drive!");
                        this.notifyStatus('AUTH_SUCCESS', { token: this.accessToken });
                        resolve(true);
                    }
                });
                resolve(true);
            } catch (e) {
                console.error("GIS initialization error:", e);
                resolve(false);
            }
        });
    }

    // Iniciar sesión interactiva (Sin forzar consentimiento repetitivo)
    async signIn() {
        if (!this.tokenClient) {
            await this.initGIS();
        }

        if (!this.tokenClient) {
            throw new Error("No se pudo inicializar Google Identity Services.");
        }

        this.isConnecting = true;
        this.notifyStatus('AUTH_CONNECTING', { msg: 'Conectando con tu Google Drive...' });
        
        return new Promise((resolve, reject) => {
            this.tokenClient.callback = async (response) => {
                this.isConnecting = false;
                if (response.error) {
                    this.notifyStatus('AUTH_ERROR', { error: response });
                    reject(response);
                    return;
                }

                this.accessToken = response.access_token;
                const expiresIn = (parseInt(response.expires_in, 10) || 3600) - 60;
                this.tokenExpiresAt = Date.now() + (expiresIn * 1000);

                localStorage.setItem('altillo_gdrive_token', this.accessToken);
                localStorage.setItem('altillo_gdrive_expires', this.tokenExpiresAt.toString());
                localStorage.setItem('altillo_gdrive_connected', 'true');

                this.notifyStatus('AUTH_SUCCESS', { token: this.accessToken });
                
                // Descubrir carpetas
                try {
                    await this.discoverDriveFolders();
                } catch(e) {
                    console.warn("Folder discovery warning:", e);
                }

                resolve(true);
            };

            // Usar prompt: '' para NO forzar pantalla de consentimiento si ya fue otorgado previamente
            this.tokenClient.requestAccessToken({ prompt: '' });
        });
    }

    // Desconectar Google Drive
    disconnect() {
        this.accessToken = null;
        this.tokenExpiresAt = 0;
        localStorage.removeItem('altillo_gdrive_token');
        localStorage.removeItem('altillo_gdrive_expires');
        localStorage.removeItem('altillo_gdrive_connected');
        this.folderCache = { rootId: null, romsId: null, savesId: null, systems: {} };
        this.notifyStatus('AUTH_DISCONNECTED');
    }

    // Auto-renovación de token silenciosa periódica
    setupSilentRefresh() {
        setInterval(async () => {
            if (this.tokenClient && this.isPreviouslyConnected()) {
                const timeLeft = this.tokenExpiresAt - Date.now();
                if (timeLeft < 15 * 60 * 1000) {
                    try {
                        this.tokenClient.requestAccessToken({ prompt: '' });
                    } catch(e) {}
                }
            }
        }, 10 * 60 * 1000);
    }

    // Auto-conectar silenciosamente al iniciar la página
    async autoConnectSilent() {
        if (this.isAuthenticated()) {
            this.notifyStatus('AUTH_SUCCESS', { token: this.accessToken });
            this.discoverDriveFolders();
            return true;
        }

        // Si el usuario ya se había conectado previamente, esperar al SDK de Google e intentar renovar
        if (this.isPreviouslyConnected() || localStorage.getItem('altillo_gdrive_token')) {
            const ready = await this.initGIS();
            if (ready && this.tokenClient) {
                try {
                    this.tokenClient.requestAccessToken({ prompt: '' });
                    return true;
                } catch(e) {
                    console.warn("Silent token request error:", e);
                }
            }
        }
        return false;
    }

    // Helper interno para peticiones REST a Google Drive API v3
    async driveRequest(url, options = {}) {
        if (!this.isAuthenticated()) {
            throw new Error("No autenticado en Google Drive");
        }

        const headers = options.headers || {};
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        options.headers = headers;

        const response = await fetch(url, options);
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Google Drive API Error (${response.status}): ${errText}`);
        }
        return response;
    }

    // Buscar una carpeta en Drive por nombre (tolerante a mayúsculas/minúsculas)
    async findFolderByName(folderName, parentId = null) {
        let query = `mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        if (parentId) {
            query += ` and '${parentId}' in parents`;
        }

        const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)&spaces=drive&pageSize=100`;
        const res = await this.driveRequest(url);
        const data = await res.json();

        if (data.files && data.files.length > 0) {
            const targetLower = folderName.toLowerCase();
            const matched = data.files.find(f => f.name.toLowerCase() === targetLower);
            return matched ? matched.id : null;
        }
        return null;
    }

    // Descubrir y cachear IDs de carpetas en Google Drive
    async discoverDriveFolders() {
        if (!this.isAuthenticated()) return null;

        try {
            // 1. Encontrar carpeta raíz 'Altillo8bits'
            let rootId = this.folderCache.rootId;
            if (!rootId) {
                rootId = await this.findFolderByName('Altillo8bits');
                this.folderCache.rootId = rootId;
            }

            if (!rootId) {
                console.warn("Carpeta 'Altillo8bits' no encontrada en la raíz de Google Drive.");
                return null;
            }

            // 2. Encontrar subcarpeta 'ROMs'
            let romsId = this.folderCache.romsId;
            if (!romsId) {
                romsId = await this.findFolderByName('ROMs', rootId);
                this.folderCache.romsId = romsId;
            }

            // 3. Encontrar subcarpeta 'Saves'
            let savesId = this.folderCache.savesId;
            if (!savesId) {
                savesId = await this.findFolderByName('Saves', rootId);
                this.folderCache.savesId = savesId;
            }

            return this.folderCache;
        } catch (e) {
            console.error("Error discovering Drive folders:", e);
            return null;
        }
    }

    // Mapeo de core a nombre de subcarpeta en Drive
    getSystemFolderName(core) {
        const map = {
            'nes': 'NES',
            'snes': 'SNES',
            'segaMD': 'Genesis',
            'genesis': 'Genesis',
            'gb': 'GB',
            'gbc': 'GB',
            'gba': 'GBA',
            'n64': 'N64',
            'psx': 'PSX'
        };
        return map[core] || 'NES';
    }

    // Listar ROMs de Google Drive para la consola activa
    async listDriveRoms(core) {
        if (!this.isAuthenticated()) return [];

        await this.discoverDriveFolders();
        if (!this.folderCache.romsId) return [];

        const sysName = this.getSystemFolderName(core);
        let sysFolderId = this.folderCache.systems[sysName];

        if (!sysFolderId) {
            sysFolderId = await this.findFolderByName(sysName, this.folderCache.romsId);
            this.folderCache.systems[sysName] = sysFolderId;
        }

        if (!sysFolderId) {
            console.log(`Subcarpeta '${sysName}' no encontrada dentro de ROMs.`);
            return [];
        }

        const query = `'${sysFolderId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`;
        const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,size,mimeType)&pageSize=100`;
        const res = await this.driveRequest(url);
        const data = await res.json();

        return (data.files || []).map(f => ({
            id: f.id,
            name: f.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' '),
            fileName: f.name,
            size: f.size,
            system: core,
            source: 'gdrive',
            driveId: f.id
        }));
    }

    // Obtener catálogo unificado (Google Drive + Local)
    async fetchCatalogForSystem(core) {
        const results = [];

        // 1. Obtener ROMs locales del servidor
        try {
            const sys = (core || 'nes').toLowerCase();
            const res = await fetch(`api/drive.php?action=list&system=${encodeURIComponent(sys)}`);
            if (res.ok) {
                const localData = await res.json();
                if (localData.success && localData.games) {
                    localData.games.forEach(g => {
                        results.push({
                            id: g.url,
                            name: g.name,
                            fileName: g.fileName,
                            size: g.size,
                            system: g.system,
                            source: 'local',
                            url: g.url
                        });
                    });
                }
            }
        } catch(e) {
            console.warn("Local catalog fetch warning:", e);
        }

        // 2. Si está conectado a Google Drive, obtener ROMs de la nube
        if (this.isAuthenticated()) {
            try {
                const driveRoms = await this.listDriveRoms(core);
                driveRoms.forEach(d => results.push(d));
            } catch (e) {
                console.warn("Drive ROM list warning:", e);
            }
        }

        return results;
    }

    // Descargar ROM como Blob directamente a memoria
    async downloadRomBlob(gameItem) {
        if (typeof gameItem === 'string') {
            if (gameItem.startsWith('http') || gameItem.startsWith('roms/')) {
                const res = await fetch(gameItem);
                if (!res.ok) throw new Error("No se pudo cargar el archivo local.");
                return await res.blob();
            }
        }

        // Si viene de Google Drive
        const driveId = (typeof gameItem === 'object') ? (gameItem.driveId || gameItem.id) : gameItem;
        if (this.isAuthenticated() && driveId) {
            if (window.AltilloUI) window.AltilloUI.showToast('Descargando cartucho desde Google Drive...', 'info');
            const url = `https://www.googleapis.com/drive/v3/files/${driveId}?alt=media`;
            const res = await this.driveRequest(url);
            return await res.blob();
        }

        // Fallback local
        if (typeof gameItem === 'object' && gameItem.url) {
            const res = await fetch(gameItem.url);
            return await res.blob();
        }

        throw new Error("No se pudo acceder al cartucho.");
    }

    // Buscar Save previo (en LocalStorage, Drive o Server)
    async findSaveFile(gameName, isState = true) {
        const ext = isState ? '.state' : '.srm';
        const cleanName = gameName
            .replace(/[\/\\?%*:|"<>]/g, '_')
            .replace(/\.(nes|sfc|smc|md|gen|bin|gb|gbc|gba|z64|n64|v64|iso|cue|chd|pbp|zip)$/i, '');
        const saveKey = `altillo_save_${cleanName}${ext}`;

        // 1. LocalStorage
        const localSaveBase64 = localStorage.getItem(saveKey);
        if (localSaveBase64) {
            return {
                source: 'local',
                data: this.base64ToBlob(localSaveBase64)
            };
        }

        // 2. Google Drive si está conectado
        if (this.isAuthenticated() && this.folderCache.savesId) {
            try {
                const fileName = `${cleanName}${ext}`;
                const query = `'${this.folderCache.savesId}' in parents and name = '${fileName}' and trashed = false`;
                const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;
                const res = await this.driveRequest(url);
                const data = await res.json();
                if (data.files && data.files.length > 0) {
                    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${data.files[0].id}?alt=media`;
                    const saveRes = await this.driveRequest(downloadUrl);
                    const blob = await saveRes.blob();
                    return { source: 'gdrive', data: blob };
                }
            } catch(e) {
                console.warn("Drive save search error:", e);
            }
        }

        // 3. Backend PHP
        try {
            const typeParam = isState ? 'state' : 'srm';
            const res = await fetch(`api/drive.php?action=get_save&gameName=${encodeURIComponent(cleanName)}&type=${typeParam}`);
            if (res.ok && res.headers.get('content-type') === 'application/octet-stream') {
                const blob = await res.blob();
                return { source: 'server', data: blob };
            }
        } catch(e) {}

        return null;
    }

    // Guardar Save silenciosamente
    async uploadSaveFile(gameName, dataBufferOrBlob, isState = true) {
        const ext = isState ? '.state' : '.srm';
        const cleanName = gameName
            .replace(/[\/\\?%*:|"<>]/g, '_')
            .replace(/\.(nes|sfc|smc|md|gen|bin|gb|gbc|gba|z64|n64|v64|iso|cue|chd|pbp|zip)$/i, '');
        const fileName = `${cleanName}${ext}`;
        const saveKey = `altillo_save_${cleanName}${ext}`;
        const blob = dataBufferOrBlob instanceof Blob ? dataBufferOrBlob : new Blob([dataBufferOrBlob], { type: 'application/octet-stream' });

        try {
            // Guardar localmente
            const base64 = await this.blobToBase64(blob);
            try {
                localStorage.setItem(saveKey, base64);
            } catch(e) {}

            // Subir a Drive si está conectado
            if (this.isAuthenticated() && this.folderCache.savesId) {
                try {
                    const query = `'${this.folderCache.savesId}' in parents and name = '${fileName}' and trashed = false`;
                    const res = await this.driveRequest(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`);
                    const data = await res.json();

                    if (data.files && data.files.length > 0) {
                        // PATCH
                        await this.driveRequest(`https://www.googleapis.com/upload/drive/v3/files/${data.files[0].id}?uploadType=media`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/octet-stream' },
                            body: blob
                        });
                    } else {
                        // POST nuevo archivo
                        const metadata = { name: fileName, parents: [this.folderCache.savesId] };
                        const boundary = '-------AltilloBoundary' + Math.random().toString(36).substring(2);
                        const delimiter = `\r\n--${boundary}\r\n`;
                        const closeDelimiter = `\r\n--${boundary}--`;
                        const metadataPart = delimiter + 'Content-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadata);
                        const dataHeader = delimiter + 'Content-Type: application/octet-stream\r\n\r\n';

                        const arrayBuf = await blob.arrayBuffer();
                        const uint8 = new Uint8Array(arrayBuf);
                        const enc = new TextEncoder();
                        const p1 = enc.encode(metadataPart + dataHeader);
                        const p3 = enc.encode(closeDelimiter);

                        const combined = new Uint8Array(p1.byteLength + uint8.byteLength + p3.byteLength);
                        combined.set(p1, 0);
                        combined.set(uint8, p1.byteLength);
                        combined.set(p3, p1.byteLength + uint8.byteLength);

                        await this.driveRequest(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`, {
                            method: 'POST',
                            headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
                            body: combined
                        });
                    }
                } catch(driveErr) {
                    console.warn("Drive save upload error:", driveErr);
                }
            }

            // Backend local
            const formData = new FormData();
            formData.append('gameName', cleanName);
            formData.append('type', isState ? 'state' : 'srm');
            formData.append('file', blob, fileName);
            fetch('api/drive.php?action=save_state', { method: 'POST', body: formData }).catch(() => {});

            if (window.AltilloUI) window.AltilloUI.showToast(`💾 ¡Partida guardada con éxito!`, 'success');
            return true;
        } catch (err) {
            console.error("Save error:", err);
            return false;
        }
    }

    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    base64ToBlob(dataUrl) {
        const parts = dataUrl.split(';base64,');
        const contentType = parts[0].split(':')[1] || 'application/octet-stream';
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], { type: contentType });
    }
}

// Instancia global
window.AltilloDrive = new AltilloDriveAPI();
