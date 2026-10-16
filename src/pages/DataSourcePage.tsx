import React, { useState } from 'react';
import {
  Radio,
  Bluetooth,
  Usb,
  Wifi,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Cpu,
  Sparkles,
  Signal,
  Battery,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { bleManager } from '../lib/bluetooth/bleManager';
import { virtualBle, ESP32_ARDUINO_SKETCH } from '../lib/bluetooth/virtualBle';
import { simulator } from '../lib/simulator/engine';
import { sound } from '../lib/sound/soundEffects';

export const DataSourcePage: React.FC = () => {
  const { connectedDevice, setConnectedDevice, equipment, logAudit } = useAppStore();

  const [bleStatus, setBleStatus] = useState<string>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [targetMachineId, setTargetMachineId] = useState('eq_cnc_1');
  const [wsUrl, setWsUrl] = useState('ws://192.168.1.150:8080/energy-feed');

  const isBleSupported = bleManager.isWebBluetoothSupported();

  const handleConnectRealBle = async () => {
    sound.playClick();
    setErrorMessage('');
    setBleStatus('scanning');
    try {
      const dev = await bleManager.scanAndConnect(targetMachineId);
      setConnectedDevice(dev);
      setBleStatus('connected');
      sound.playGhostBusted();
      logAudit('BLE_CONNECTED', `Real BLE device paired to machine ${targetMachineId}`, 'info');

      bleManager.onReading((reading) => {
        simulator.overrideEquipmentFromExternal(
          targetMachineId,
          reading.powerKw,
          reading.currentAmps,
          reading.tempC
        );
      });
    } catch (err: any) {
      setBleStatus('error');
      setErrorMessage(
        err.message || 'Web Bluetooth scan cancelled or unsupported in this browser.'
      );
    }
  };

  const handleConnectVirtualBle = () => {
    sound.playClick();
    const dev = virtualBle.connect(targetMachineId, (reading) => {
      simulator.overrideEquipmentFromExternal(
        targetMachineId,
        reading.powerKw,
        reading.currentAmps,
        reading.tempC
      );
    });
    setConnectedDevice(dev);
    setBleStatus('connected');
    sound.playGhostBusted();
    logAudit('VIRTUAL_BLE_CONNECTED', `Virtual ESP32 paired to machine ${targetMachineId}`, 'info');
  };

  const handleDisconnect = () => {
    sound.playClick();
    bleManager.disconnect();
    virtualBle.disconnect();
    setConnectedDevice(null);
    setBleStatus('idle');
  };

  const handleCopySketch = () => {
    navigator.clipboard.writeText(ESP32_ARDUINO_SKETCH);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 m-0">
            <Radio className="w-6 h-6 text-[#00FFC6]" />
            <span>Data Source & Hardware Integration Manager</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Connect real BLE energy monitors (ESP32/Arduino), Web Serial meters, or stream over WebSockets.
          </p>
        </div>

        {/* Browser Compatibility Notice */}
        <div className="flex items-center gap-2">
          {isBleSupported ? (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Web Bluetooth Supported</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Use Chrome/Edge for Real BLE (Or use Virtual BLE)</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Device Pairing Wizard (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Device Card if connected */}
          {connectedDevice ? (
            <div className="glass-panel p-6 rounded-3xl border-emerald-500/40 bg-emerald-950/20 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300">
                    <Bluetooth className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                      {connectedDevice.kind === 'virtual' ? 'VIRTUAL BLE DEVICE' : 'PHYSICAL HARDWARE LINK'}
                    </span>
                    <h3 className="text-lg font-bold text-white">{connectedDevice.name}</h3>
                  </div>
                </div>

                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold transition border border-red-500/40"
                >
                  Disconnect
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Signal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Signal RSSI</span>
                  </div>
                  <div className="text-base font-bold text-white font-mono mt-1">
                    {connectedDevice.rssi} dBm
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Battery</span>
                  </div>
                  <div className="text-base font-bold text-white font-mono mt-1">
                    {connectedDevice.battery}%
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-slate-400">Target Asset</div>
                  <div className="text-base font-bold text-[#00FFC6] font-mono mt-1 truncate">
                    {targetMachineId}
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-300">
                ✓ Telemetry is currently streaming live into the 3D Twin and driving real-time Ghost Gap calculations.
              </div>
            </div>
          ) : (
            /* Pair Device Options */
            <div className="glass-panel p-6 rounded-3xl space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white">Connect BLE Energy Meter</h3>
                <p className="text-xs text-slate-400">
                  Pair a physical ESP32 current-clamp sensor or launch the instant Virtual BLE device.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Map Readings To Machine
                </label>
                <select
                  value={targetMachineId}
                  onChange={(e) => setTargetMachineId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#00FFC6]"
                >
                  {equipment.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.zone})
                    </option>
                  ))}
                </select>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs">
                  {errorMessage}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleConnectRealBle}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  <Bluetooth className="w-4 h-4" />
                  <span>Scan Real BLE Device</span>
                </button>

                <button
                  onClick={handleConnectVirtualBle}
                  className="flex-1 py-3 px-4 bg-[#00FFC6] hover:bg-[#33ffdc] text-black font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-[#00FFC6]/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Connect Virtual BLE (Instant Demo)</span>
                </button>
              </div>
            </div>
          )}

          {/* Alternative Data Feeds (WebSocket & Serial) */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wifi className="w-5 h-5 text-purple-400" />
              <span>Alternative Real-Time Data Streams</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  WebSocket / MQTT-over-WS URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={wsUrl}
                    onChange={(e) => setWsUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white font-mono"
                  />
                  <button
                    onClick={() => {
                      sound.playClick();
                      logAudit('WS_STREAM_CONNECT', `Connected to WS feed at ${wsUrl}`, 'info');
                    }}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs rounded-xl"
                  >
                    Connect WS
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: ESP32 Firmware Snippet & Documentation (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-panel p-6 rounded-3xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">ESP32 Arduino BLE Firmware</h3>
              </div>
              <button
                onClick={handleCopySketch}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Sketch'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Flash this code directly to an ESP32 or ESP32-S3 connected to a current clamp (CT sensor) to broadcast live BLE power readings.
            </p>

            <div className="max-h-80 overflow-y-auto p-3 bg-black/80 rounded-xl border border-white/10 font-mono text-[11px] text-slate-300 leading-relaxed">
              <pre>{ESP32_ARDUINO_SKETCH}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
