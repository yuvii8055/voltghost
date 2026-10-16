# 👻 VoltGhost — Hunt Your Energy Ghosts

> **"Sustainable Energy Monitoring and Optimization"**: An intelligent platform that uses **Computer Vision** and **sensor data** to monitor energy-consuming equipment, a **3D Digital Twin** to simulate energy consumption, and **Generative AI** ("Carbon Coach") to suggest strategies for reducing energy waste and carbon emissions.

---

## ⚡ 1. The Core Concept: The "Ghost Twin" & "Ghost Gap"

In industrial facilities and smart buildings, machines consume far more energy than necessary due to idling, pneumatic leaks, thermal jacket degradation, and unoptimized operational schedules.

- **Ghost Twin**: Every machine has a translucent, ideal-efficiency design version of itself operating at optimal thermodynamic physics.
- **Ghost Gap**:
  $$\text{Ghost Gap (kW)} = \text{Real Consumption (kW)} - \text{Ghost Twin Consumption (kW)}$$
  The Ghost Gap represents pure, avoidable waste. VoltGhost accumulates it live in **kWh**, **₹ (INR)**, and **kg CO₂e**.
- **Sensor-Vision Cross-Modal Fusion**: Equipment sensors and Computer Vision occupancy are fused so that waste invisible to either alone is immediately caught (e.g. 5-Axis CNC drawing 38.6 kW while Vision confirms zero operators in the workcell for > 12 minutes).
- **Carbon Coach (Generative AI)**: Explains the root causes of the Ghost Gap and delivers ranked, quantified ROI action plans that can be simulated on the Digital Twin before physical rollout.

---

## 🔑 2. Seed Demo Credentials

VoltGhost includes an in-browser local authentication engine powered by **WebCrypto PBKDF2** (10,000 rounds of SHA-256) with salted key derivation.

| Role | Email | Password | Permissions & Features |
| :--- | :--- | :--- | :--- |
| **Master Admin** | `admin@voltghost.io` | `Admin@123` | **Full access**: Master Admin Console (`/admin`), user management, policy engine, kill-switches, audit logs, scenario approvals |
| **Operator** | `operator@voltghost.io` | `Operator@123` | Command Center, 3D Twin, What-If Simulator, Vision Lab, Carbon Coach, Maintenance tickets, BLE device pairing |
| **Viewer** | `viewer@voltghost.io` | `Viewer@123` | Read-only dashboards, 3D Digital Twin, Analytics, ESG reports |

*Note: For 2FA-enabled accounts (such as Admin), the simulated demo TOTP code is **`123456`**.*

---

## 🚀 3. Quick Start & Setup

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### Installation & Run
```bash
# 1. Clone or navigate to the project directory
cd voltghost

# 2. Install dependencies
npm install

# 3. (Optional) Configure Gemini API Key
cp .env.example .env
# Edit .env and set VITE_GEMINI_API_KEY=your_key_here
# If omitted, VoltGhost automatically runs its realistic offline Carbon Coach fallback!

# 4. Start local development server
npm run dev

# 5. Build for production
npm run build
```

---

## 🏗️ 4. Architecture & Folder Structure

```
voltghost/
├── public/
│   ├── favicon.svg              # VoltGhost neon ghost icon
│   └── manifest.json            # PWA manifest
├── src/
│   ├── types/
│   │   └── index.ts             # Complete TypeScript data contracts
│   ├── lib/
│   │   ├── auth/                # WebCrypto PBKDF2 hashing, session tokens, RBAC
│   │   ├── simulator/           # 12-machine factory engine, 1x/10x/60x speed, Monte Carlo
│   │   ├── vision/              # Local in-browser CV, zone mapping, fusion engine
│   │   ├── bluetooth/           # Web Bluetooth API, GATT service, Virtual BLE emulator
│   │   ├── ai/                  # Gemini client + offline multilingual Carbon Coach
│   │   ├── sound/               # Web Audio API procedural sound synthesizer
│   │   ├── export/              # PDF sustainability report & CSV export
│   │   └── themes/              # 7 theme presets & CSS design token manager
│   ├── store/
│   │   └── useAppStore.ts       # Unified persisted Zustand store
│   ├── components/
│   │   ├── common/              # Dynamic Island, Custom Cursor, Command Palette, Tour
│   │   ├── layout/              # Navbar, Sidebar, Layout wrapper
│   │   ├── twin/                # Three.js / R3F 3D facility, Machine3D, AR video overlay
│   │   └── charts/              # Real vs Ghost SVG chart, Sankey flow, Carbon ring
│   ├── pages/                   # All 13 application views
│   ├── App.tsx                  # Main router and hotkey manager
│   └── main.tsx                 # React DOM entrypoint
```

---

## 📡 5. Bluetooth Integration & GATT Profile

VoltGhost supports real Bluetooth Low Energy (BLE) energy meters, wireless CT clamps, and ESP32 / Arduino sensor boards via the **Web Bluetooth API**.

### Documented GATT Service & Characteristics
- **Service UUID**: `4fafc201-1fb5-459e-8fcc-c5c9c331914b`
- **Active Power Characteristic (kW)**: `beb5483e-36e1-4688-b7f5-ea07361b26a8` (Float32, Read / Notify)
- **Current Characteristic (Amps)**: `beb5483f-36e1-4688-b7f5-ea07361b26a8` (Float32, Read / Notify)
- **Environmental Sensing Characteristic (Temp °C)**: `00002a6e-0000-1000-8000-00805f9b34fb` (0x181A standard)

### ESP32 Arduino Firmware Snippet
```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define POWER_CHAR_UUID     "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLECharacteristic *pPowerChar;

void setup() {
  BLEDevice::init("VoltGhost-ESP32-Meter");
  BLEServer *pServer = BLEDevice::createServer();
  BLEService *pService = pServer->createService(SERVICE_UUID);
  pPowerChar = pService->createCharacteristic(
    POWER_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  pPowerChar->addDescriptor(new BLE2902());
  pService->start();
  BLEDevice::getAdvertising()->start();
}

void loop() {
  float powerKw = 2.45 + ((float)(random(-20, 20)) / 100.0);
  pPowerChar->setValue((uint8_t*)&powerKw, 4);
  pPowerChar->notify();
  delay(1000);
}
```

*Judges without physical hardware can click **"Connect Virtual BLE Device (ESP32-Meter-01)"** on the Data Sources page to experience the identical real-time telemetry stream.*

---

## 🌐 6. Browser Compatibility Matrix

| Feature | Chrome (Desktop & Android) | Edge (Desktop) | Safari (macOS & iOS) | Firefox | Opera / Brave |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **3D Digital Twin (WebGL / Three.js)** | ✅ Supported | ✅ Supported | ✅ Supported | ✅ Supported | ✅ Supported |
| **Web Bluetooth API** | ✅ Supported | ✅ Supported | ⚠️ (Requires Bluefy) | ❌ Unsupported | ✅ Supported |
| **Computer Vision (Webcam / getUserMedia)** | ✅ Supported | ✅ Supported | ✅ Supported | ✅ Supported | ✅ Supported |
| **Web Speech Recognition** | ✅ Supported | ✅ Supported | ✅ Supported | ❌ Polyfilled | ✅ Supported |
| **SpeechSynthesis (TTS Voice Replies)** | ✅ Supported | ✅ Supported | ✅ Supported | ✅ Supported | ✅ Supported |
| **Web Audio API Procedural Sounds** | ✅ Supported | ✅ Supported | ✅ Supported | ✅ Supported | ✅ Supported |
| **PWA Installable Shell** | ✅ Supported | ✅ Supported | ✅ Supported | ⚠️ Manual | ✅ Supported |

---

## 🎯 7. How VoltGhost Maps to the Hackathon Problem Statement

| Problem Statement Requirement | VoltGhost Implementation |
| :--- | :--- |
| **"Uses Computer Vision to monitor energy-consuming equipment"** | **Vision Lab (`/vision`)**: In-browser edge processing of camera feeds, zone bounding boxes, occupant count, luminance analysis, and "Machine running unattended" detection. 100% private on-device processing. |
| **"Uses sensor data"** | **Data Sources (`/datasources`)**: Pluggable telemetry engine supporting Web Bluetooth (ESP32 CT clamps), Web Serial, WebSockets, and realistic stochastic multi-machine simulation. |
| **"A Digital Twin to simulate energy consumption"** | **3D Digital Twin (`/twin`) & What-If Simulator (`/whatif`)**: Interactive procedural 3D factory floor with REAL, GHOST, GAP, THERMAL, and CARBON modes. Monte Carlo simulation predicts daily kWh, peak kW, and payback period. |
| **"Generative AI to suggest strategies for reducing waste"** | **Carbon Coach (`/coach`)**: Gemini-powered AI grounded in live JSON SCADA context. Features CFO, Eco, Engineer, and ELI10 persona modes, multilingual output (English, Hindi, Kannada), and one-click "Simulate this on Twin". |

---

## 🎬 8. 3-Minute Demo Walkthrough Script for Judges

1. **Landing Hero (`/`)**: Move your cursor over the ghostly factory background. Notice the flashlight spotlight and live counters. Click **"Launch Instant Demo (Admin)"** to authenticate.
2. **Dynamic Island**: Observe the Apple-style black pill at top-center ticking with the live Ghost Gap. Click it to expand the Mini Control Center (toggle audio, lock screen, launch coach).
3. **Command Center (`/dashboard`)**: Inspect the 7 KPI cards and the live Real vs Ghost chart with shaded red glowing gap area. Click **"Speed: 10x"** to watch daily waste accumulate rapidly.
4. **3D Digital Twin (`/twin`)**: Switch visual modes to **"GAP Overlay"** — wasteful machines glow radiant crimson. Drag the time scrubber or click **"Ghost Replay"** to watch day/night shift variations. Click **"AR X-Ray Mode"** to see live HUD labels over camera.
5. **Vision Lab (`/vision`)**: Click **"Trigger: Operator Leaves CNC Cell"**. Notice the Sensor-Vision Fusion engine trigger an immediate unattended anomaly badge in the Dynamic Island!
6. **Carbon Coach (`/coach`)**: Click the suggested prompt chip *"Generate Action Plan"*. Review the ranked strategy cards with Impact/Effort/Payback chips. Click **"Simulate this on Twin"**.
7. **What-If Simulator (`/whatif`)**: Adjust the **Shift Loads Off-Peak** and **HVAC Setpoint** sliders. View the instant Before vs After delta (saving ₹1.4L/year). Click **"Submit for Approval"**.
8. **Master Admin Console (`/admin`)**: Tour the gold-accented console. Go to **Policy Engine & Approvals** to approve the scenario. Notice the Ghost Gap shrink, Eco Score climb, and celebratory confetti fire from the Dynamic Island! Click **"Export Audit CSV"** and **"Generate PDF Audit Report"** to conclude.

---

## 🔒 9. Security & Production Deployment Notes

- **Client-Side PBKDF2**: Passwords are never stored in plaintext. They are salted with 16 random cryptographic bytes and hashed through 10,000 PBKDF2 iterations using the browser's native `crypto.subtle` API.
- **Production Backend**: For commercial deployment, replace `AuthService` with Firebase Auth, Supabase Auth, or a secure OAuth2 / OIDC provider.
- **Privacy Assurance**: All Computer Vision processing occurs directly on the client canvas; no camera frames are transmitted to external servers.

---

### Built with ❤️ for the Hackathon by the VoltGhost Engineering Pair
