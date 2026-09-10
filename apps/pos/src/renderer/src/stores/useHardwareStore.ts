import { create } from 'zustand';

export interface SystemPrinterItem {
  name: string;
  displayName?: string;
  description?: string;
  isDefault?: boolean;
}

export interface NetworkPrinterItem {
  ip: string;
  port: number;
  latency: number;
}

export interface PrinterStatus {
  connected: boolean;
  checking: boolean;
  message: string;
  latency?: number;
  paperWidth: 80 | 58;
  host: string;
  port: number;
  systemPrinterName: string;
  type: 'system' | 'network' | 'preview';
  lastChecked: string | null;
}

interface HardwareState {
  printerStatus: PrinterStatus;
  systemPrinters: SystemPrinterItem[];
  networkPrintersFound: NetworkPrinterItem[];
  isScanning: boolean;
  isVirtualSimulator: boolean;
  isBannerDismissed: boolean;
  isFullscreen: boolean;

  fetchSystemPrinters: () => Promise<void>;
  scanNetwork: (subnet?: string) => Promise<void>;
  checkPrinterStatus: () => Promise<void>;
  updatePrinterConfig: (config: Partial<PrinterStatus>) => Promise<void>;
  setVirtualSimulator: (enabled: boolean) => void;
  toggleVirtualSimulator: () => void;
  setBannerDismissed: (dismissed: boolean) => void;
  toggleFullscreen: () => Promise<void>;
  openCashDrawer: () => Promise<boolean>;
}

export const useHardwareStore = create<HardwareState>((set, get) => ({
  printerStatus: {
    connected: false,
    checking: false,
    message: 'Belum Terhubung (Tidak terdeteksi printer thermal fisik)',
    latency: undefined,
    paperWidth: 80,
    host: '192.168.1.100',
    port: 9100,
    systemPrinterName: '',
    type: 'system',
    lastChecked: null,
  },
  systemPrinters: [],
  networkPrintersFound: [],
  isScanning: false,
  isVirtualSimulator: false,
  isBannerDismissed: false,
  isFullscreen: false,

  setBannerDismissed: (isBannerDismissed) => set({ isBannerDismissed }),

  fetchSystemPrinters: async () => {
    try {
      if ((window as any).posAPI?.getSystemPrinters) {
        const list = await (window as any).posAPI.getSystemPrinters();
        set({ systemPrinters: list || [] });
        
        // Auto-select default printer if none selected
        const current = get().printerStatus;
        if (!current.systemPrinterName && list && list.length > 0) {
          const defaultPrn = list.find((p: any) => p.isDefault) || list[0];
          set((state) => ({
            printerStatus: { ...state.printerStatus, systemPrinterName: defaultPrn.name }
          }));
        }
      } else {
        // Fallback for browser demo
        set({
          systemPrinters: [
            { name: 'POS-80 Series Thermal Printer', displayName: 'POS-80 (USB)', isDefault: true },
            { name: 'EPSON TM-T82 Receipt', displayName: 'EPSON TM-T82 (USB)', isDefault: false },
            { name: 'Microsoft Print to PDF', displayName: 'Microsoft Print to PDF', isDefault: false },
          ]
        });
      }
    } catch (e) {
      console.warn('Failed to fetch system printers:', e);
    }
  },

  scanNetwork: async (subnet = '192.168.1') => {
    set({ isScanning: true });
    try {
      if ((window as any).posAPI?.scanNetworkPrinters) {
        const found = await (window as any).posAPI.scanNetworkPrinters(subnet);
        set({ networkPrintersFound: found || [], isScanning: false });
      } else {
        await new Promise((r) => setTimeout(r, 1200));
        set({
          networkPrintersFound: [
            { ip: '192.168.1.100', port: 9100, latency: 12 },
          ],
          isScanning: false,
        });
      }
    } catch (e) {
      set({ isScanning: false });
    }
  },

  setVirtualSimulator: (isVirtualSimulator) => {
    set((state) => ({
      isVirtualSimulator,
      printerStatus: {
        ...state.printerStatus,
        connected: isVirtualSimulator,
        message: isVirtualSimulator
          ? 'Printer Virtual Simulator Aktif (Siap Cetak Preview)'
          : 'Printer Thermal Terputus (Tidak terdeteksi hardware fisik)',
        latency: isVirtualSimulator ? 3 : undefined,
        lastChecked: new Date().toLocaleTimeString('id-ID'),
      },
      isBannerDismissed: isVirtualSimulator,
    }));
  },

  toggleVirtualSimulator: () => {
    const current = get().isVirtualSimulator;
    get().setVirtualSimulator(!current);
  },

  checkPrinterStatus: async () => {
    set((state) => ({
      printerStatus: { ...state.printerStatus, checking: true },
    }));

    try {
      const isVirtual = get().isVirtualSimulator;
      if (isVirtual) {
        set((state) => ({
          printerStatus: {
            ...state.printerStatus,
            checking: false,
            connected: true,
            message: 'Printer Virtual Simulator Aktif (Siap Cetak Preview)',
            latency: 3,
            lastChecked: new Date().toLocaleTimeString('id-ID'),
          },
        }));
        return;
      }

      if ((window as any).posAPI?.checkPrinterStatus) {
        const res = await (window as any).posAPI.checkPrinterStatus();
        set((state) => ({
          printerStatus: {
            ...state.printerStatus,
            checking: false,
            connected: Boolean(res.connected),
            message: res.message || (res.connected ? 'Printer Siap' : 'Printer Terputus (Offline)'),
            latency: res.latency,
            paperWidth: res.paperWidth || state.printerStatus.paperWidth,
            host: res.host || state.printerStatus.host,
            port: res.port || state.printerStatus.port,
            systemPrinterName: res.systemPrinterName || state.printerStatus.systemPrinterName,
            type: res.type || state.printerStatus.type,
            lastChecked: new Date().toLocaleTimeString('id-ID'),
          },
        }));
      } else {
        // In browser without hardware, default to DISCONNECTED
        await new Promise((r) => setTimeout(r, 400));
        set((state) => ({
          printerStatus: {
            ...state.printerStatus,
            checking: false,
            connected: false,
            message: 'Printer Terputus (Tidak terdeteksi hardware printer fisik di port/driver)',
            latency: undefined,
            lastChecked: new Date().toLocaleTimeString('id-ID'),
          },
        }));
      }
    } catch (e: any) {
      set((state) => ({
        printerStatus: {
          ...state.printerStatus,
          checking: false,
          connected: false,
          message: 'Gagal menghubungi service printer',
          lastChecked: new Date().toLocaleTimeString('id-ID'),
        },
      }));
    }
  },

  updatePrinterConfig: async (config) => {
    set((state) => ({
      printerStatus: {
        ...state.printerStatus,
        ...config,
      },
    }));

    if ((window as any).posAPI?.setPrinterConfig) {
      await (window as any).posAPI.setPrinterConfig(config);
    }
    await get().checkPrinterStatus();
  },

  toggleFullscreen: async () => {
    try {
      if ((window as any).posAPI?.toggleFullscreen) {
        const isFull = await (window as any).posAPI.toggleFullscreen();
        set({ isFullscreen: isFull });
      } else {
        // Browser DOM fullscreen API fallback
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
          set({ isFullscreen: true });
        } else {
          await document.exitFullscreen();
          set({ isFullscreen: false });
        }
      }
    } catch (e) {
      console.warn('Fullscreen toggle error:', e);
    }
  },

  openCashDrawer: async () => {
    try {
      if ((window as any).posAPI?.openCashDrawer) {
        return await (window as any).posAPI.openCashDrawer();
      }
      return get().isVirtualSimulator || get().printerStatus.connected;
    } catch (e) {
      return false;
    }
  },
}));
