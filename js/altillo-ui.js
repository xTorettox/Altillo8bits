/**
 * ==========================================================================
 * EL ALTILLO 8-BITS — RETRO UI, SOUND EFFECTS & NAVIGATION CONTROLLER
 * ==========================================================================
 * Provides 8-bit procedural Web Audio sound synthesis, cozy day/night lighting,
 * console shelf selector, retro toast notifications, and modal dialogs.
 */

class AltilloUIManager {
    constructor() {
        this.soundEnabled = true;
        this.audioCtx = null;
        this.isNight = false;
        this.currentTab = 'drive'; // 'drive', 'local', 'upload'
    }

    // Inicializar sintetizador Web Audio API para efectos 8-bits
    initAudio() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
            }
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) {
            soundBtn.innerText = this.soundEnabled ? '🔊 SFX: ON' : '🔇 SFX: OFF';
        }
        this.showToast(this.soundEnabled ? 'Efectos de sonido 8-bits activados' : 'Sonido silenciado', 'info');
        if (this.soundEnabled) this.playRetroSound('select');
    }

    // Generador de efectos de sonido procedurales de 8 bits
    playRetroSound(type = 'click') {
        if (!this.soundEnabled) return;
        try {
            this.initAudio();
            if (!this.audioCtx) return;

            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            switch (type) {
                case 'coin': // Clásico sonido estilo moneda de Mario
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(987.77, now); // B5
                    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
                    gain.gain.setValueAtTime(0.15, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                    osc.start(now);
                    osc.stop(now + 0.35);
                    break;

                case 'switch': // Interruptor de luz
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(220, now);
                    osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;

                case 'save': // Fanfarria corta de guardado exitoso
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(523.25, now); // C5
                    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
                    osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
                    osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                    osc.start(now);
                    osc.stop(now + 0.5);
                    break;

                case 'error': // Sonido de error retro
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(150, now);
                    osc.frequency.setValueAtTime(100, now + 0.1);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                    osc.start(now);
                    osc.stop(now + 0.25);
                    break;

                case 'select':
                default:
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(440, now);
                    osc.frequency.setValueAtTime(880, now + 0.04);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;
            }
        } catch (e) {
            console.warn("Audio play error", e);
        }
    }

    // Sistema de Notificaciones Toast Retro
    showToast(message, type = 'info') {
        const container = document.getElementById('retro-toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `retro-toast ${type}`;
        
        let icon = '💬';
        if (type === 'success') icon = '⭐';
        if (type === 'error') icon = '💀';
        if (type === 'warning') icon = '⚠️';
        if (type === 'info') icon = '🕹️';

        toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }

    // Alternar interruptor de Luz (Modo Día / Noche)
    cambiarLuz() {
        this.playRetroSound('switch');
        this.isNight = !this.isNight;

        const prender = document.getElementById("llaveoff");
        const apagar = document.getElementById("llaveon");
        const cuerpo = document.getElementsByTagName("BODY")[0];
        const menu = document.getElementById("menu");
        const cabeza = document.getElementById("cabecera");
        const logo = document.getElementById("logo");
        const globoLuz = document.getElementById("globoLuz");
        const globoOsc = document.getElementById("globoOsc");
        const pie = document.getElementById("pie");

        if (this.isNight) {
            if (prender) prender.style.display = "flex";
            if (apagar) apagar.style.display = "none";
            if (globoOsc) globoOsc.style.display = "flex";
            if (globoLuz) globoLuz.style.display = "none";
            if (cuerpo) cuerpo.style.backgroundImage = "url('img/FondoNoche.jpg')";
            if (menu) menu.className = "menuOff";
            if (cabeza) cabeza.className = "cabeceraOff";
            if (logo) logo.src = "img/Altillo_Nite.png";
            if (pie) pie.className = "pieOff";
            this.showToast('Luz apagada... Ambiente nocturno del altillo activado.', 'info');
        } else {
            if (prender) prender.style.display = "none";
            if (apagar) apagar.style.display = "flex";
            if (globoOsc) globoOsc.style.display = "none";
            if (globoLuz) globoLuz.style.display = "flex";
            if (cuerpo) cuerpo.style.backgroundImage = "url('img/FondoDia.jpg')";
            if (menu) menu.className = "menuOn";
            if (cabeza) cabeza.className = "cabeceraOn";
            if (logo) logo.src = "img/Altillo-8-Bits.png";
            if (pie) pie.className = "pieOn";
            this.showToast('Luz encendida. ¡Buenos días!', 'info');
        }
    }

    // Navegación entre secciones
    showSection(sectionId) {
        this.playRetroSound('select');
        const sections = [
            'seccionEmulador',
            'seccionBienvenida',
            'seccionRoms',
            'seccionContacto',
            'seccionAyuda',
            'seccionAcercaDe',
            'seccionMapa'
        ];

        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = (id === sectionId) ? 'block' : 'none';
            }
        });

        // Scroll al inicio del cuerpo
        const cuerpo = document.getElementById('cuerpo');
        if (cuerpo) cuerpo.scrollTop = 0;
    }

    // Selector de pestaña en el explorador de ROMs
    setRomTab(tabName) {
        this.playRetroSound('select');
        this.currentTab = tabName;

        document.querySelectorAll('.rom-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        const catalogPanel = document.getElementById('roms-tab-catalog');
        const uploadPanel = document.getElementById('roms-tab-upload');

        if (catalogPanel) catalogPanel.style.display = (tabName === 'catalog') ? 'block' : 'none';
        if (uploadPanel) uploadPanel.style.display = (tabName === 'upload') ? 'block' : 'none';
    }

    // Manejo de Modales
    openModal(modalId) {
        this.playRetroSound('select');
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeModal(modalId) {
        this.playRetroSound('select');
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// Instancia global
window.AltilloUI = new AltilloUIManager();
