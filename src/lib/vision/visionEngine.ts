import { VisionZone, VisionDetection } from '../../types';

export interface VisionState {
  isStreaming: boolean;
  hasCameraPermission: boolean;
  privacyMode: boolean; // Process 100% locally
  fps: number;
  zones: VisionZone[];
  detections: VisionDetection[];
  selectedCameraId?: string;
  availableCameras: { deviceId: string; label: string }[];
  incidentGallery: { id: string; timestamp: string; label: string; snapshot: string }[];
}

export const INITIAL_ZONES: VisionZone[] = [
  {
    id: 'zone_cnc',
    name: 'Machining Workcell (CNC-A)',
    mappedEquipmentId: 'eq_cnc_1',
    x: 10,
    y: 15,
    width: 35,
    height: 40,
    personCount: 0, // Operator has left!
    lastPersonDetectedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    brightnessLevel: 72,
    color: '#00FFC6',
  },
  {
    id: 'zone_hvac',
    name: 'Cleanroom & HVAC Enclosure',
    mappedEquipmentId: 'eq_hvac_clean',
    x: 55,
    y: 15,
    width: 35,
    height: 35,
    personCount: 1,
    lastPersonDetectedAt: new Date().toISOString(),
    brightnessLevel: 65,
    color: '#8B5CF6',
  },
  {
    id: 'zone_logistics',
    name: 'Logistics High Bay Grid',
    mappedEquipmentId: 'eq_lighting_1',
    x: 20,
    y: 60,
    width: 60,
    height: 35,
    personCount: 0,
    lastPersonDetectedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    brightnessLevel: 94, // High luminance in empty room
    color: '#F59E0B',
  },
];

export class VisionEngine {
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private stream: MediaStream | null = null;
  private state: VisionState;
  private animFrameId: number | null = null;
  private listeners: ((state: VisionState) => void)[] = [];

  constructor() {
    this.state = {
      isStreaming: false,
      hasCameraPermission: false,
      privacyMode: true,
      fps: 30,
      zones: JSON.parse(JSON.stringify(INITIAL_ZONES)),
      detections: [],
      availableCameras: [],
      incidentGallery: [],
    };
  }

  async getCameraDevices(): Promise<{ deviceId: string; label: string }[]> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return [{ deviceId: 'simulated', label: 'Simulated High-Res Camera' }];
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices
        .filter((d) => d.kind === 'videoinput')
        .map((d, i) => ({
          deviceId: d.deviceId || `cam_${i}`,
          label: d.label || `Camera ${i + 1}`,
        }));
      if (cameras.length === 0) {
        cameras.push({ deviceId: 'simulated', label: 'Simulated Factory Camera' });
      }
      this.state.availableCameras = cameras;
      this.notify();
      return cameras;
    } catch {
      return [{ deviceId: 'simulated', label: 'Simulated Factory Camera' }];
    }
  }

  async startCamera(deviceId?: string): Promise<boolean> {
    try {
      if (this.stream) {
        this.stream.getTracks().forEach((t) => t.stop());
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints: MediaStreamConstraints = {
          video: deviceId && deviceId !== 'simulated' ? { deviceId: { exact: deviceId } } : true,
          audio: false,
        };
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.state.hasCameraPermission = true;
        this.state.isStreaming = true;
        this.state.selectedCameraId = deviceId;
      } else {
        // Fallback to simulated mode
        this.state.hasCameraPermission = true;
        this.state.isStreaming = true;
        this.state.selectedCameraId = 'simulated';
      }
      this.notify();
      return true;
    } catch (err) {
      // Graceful fallback to simulated camera
      this.state.hasCameraPermission = false;
      this.state.isStreaming = true;
      this.state.selectedCameraId = 'simulated';
      this.notify();
      return false;
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    this.state.isStreaming = false;
    this.notify();
  }

  attachVideo(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    this.videoElement = video;
    this.canvasElement = canvas;
    if (this.stream && video) {
      video.srcObject = this.stream;
      video.play().catch(() => {});
    }
    this.startDetectionLoop();
  }

  private startDetectionLoop() {
    let lastTime = performance.now();
    let frameCount = 0;

    const loop = () => {
      const now = performance.now();
      frameCount++;
      if (now - lastTime >= 1000) {
        this.state.fps = frameCount;
        frameCount = 0;
        lastTime = now;
      }

      this.processFrame();
      this.animFrameId = requestAnimationFrame(loop);
    };

    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = requestAnimationFrame(loop);
  }

  private processFrame() {
    // Generate realistic detection boxes based on zones and simulated states
    const dets: VisionDetection[] = [];

    // Check zones
    this.state.zones.forEach((z) => {
      if (z.personCount > 0) {
        dets.push({
          label: 'person',
          confidence: 0.94,
          box: [
            (z.x + z.width * 0.25) / 100,
            (z.y + z.height * 0.2) / 100,
            (z.width * 0.5) / 100,
            (z.height * 0.6) / 100,
          ],
        });
      }
    });

    this.state.detections = dets;
    this.notify();
  }

  // Simulated Event triggers for demo without camera
  triggerSimulatedEvent(
    eventType: 'operator_leaves' | 'operator_enters' | 'door_open' | 'lights_empty'
  ) {
    if (eventType === 'operator_leaves') {
      const zone = this.state.zones.find((z) => z.id === 'zone_cnc');
      if (zone) {
        zone.personCount = 0;
        zone.lastPersonDetectedAt = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      }
    } else if (eventType === 'operator_enters') {
      const zone = this.state.zones.find((z) => z.id === 'zone_cnc');
      if (zone) {
        zone.personCount = 1;
        zone.lastPersonDetectedAt = new Date().toISOString();
      }
    } else if (eventType === 'lights_empty') {
      const zone = this.state.zones.find((z) => z.id === 'zone_logistics');
      if (zone) {
        zone.personCount = 0;
        zone.brightnessLevel = 98;
      }
    }
    this.notify();
  }

  updateZone(updatedZone: VisionZone) {
    this.state.zones = this.state.zones.map((z) => (z.id === updatedZone.id ? updatedZone : z));
    this.notify();
  }

  captureSnapshot(label: string): string {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 640, 360);

      // Draw grid
      ctx.strokeStyle = 'rgba(0, 255, 198, 0.2)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 640; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 360);
        ctx.stroke();
      }

      // Draw label & timestamp
      ctx.fillStyle = '#00FFC6';
      ctx.font = 'bold 16px "Space Grotesk", sans-serif';
      ctx.fillText(`[VOLTGHOST CV INCIDENT SNAPSHOT] ${label.toUpperCase()}`, 20, 36);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillText(`Timestamp: ${new Date().toISOString()} | Fusion Confirmed`, 20, 60);

      // Draw bounding box
      ctx.strokeStyle = '#FF3366';
      ctx.lineWidth = 3;
      ctx.strokeRect(180, 90, 240, 180);
      ctx.fillStyle = '#FF3366';
      ctx.fillText('ANOMALY: UNATTENDED RUNNING MACHINE (0 PERSONS DETECTED)', 185, 82);
    }
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    this.state.incidentGallery.unshift({
      id: 'snap_' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      label,
      snapshot: dataUrl,
    });
    this.notify();
    return dataUrl;
  }

  getState(): VisionState {
    return this.state;
  }

  subscribe(listener: (state: VisionState) => void): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.state));
  }
}

export const visionEngine = new VisionEngine();
