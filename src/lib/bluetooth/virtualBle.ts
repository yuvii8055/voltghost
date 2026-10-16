import { BleDevice } from '../../types';

export const ESP32_ARDUINO_SKETCH = `/*
  VoltGhost ESP32 BLE Energy Monitor Firmware
  Reads CT Clamp / ADE7953 power meter and broadcasts over BLE
*/
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define POWER_CHAR_UUID     "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define CURRENT_CHAR_UUID   "beb5483f-36e1-4688-b7f5-ea07361b26a8"

BLEServer* pServer = NULL;
BLECharacteristic* pPowerCharacteristic = NULL;
bool deviceConnected = false;

void setup() {
  Serial.begin(115200);
  BLEDevice::init("VoltGhost-ESP32-Meter");
  pServer = BLEDevice::createServer();
  
  BLEService *pService = pServer->createService(SERVICE_UUID);
  pPowerCharacteristic = pService->createCharacteristic(
      POWER_CHAR_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  pPowerCharacteristic->addDescriptor(new BLE2902());
  
  pService->start();
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->start();
  Serial.println("VoltGhost BLE Server Advertising...");
}

void loop() {
  // Read simulated/real CT sensor on ADC pin 34
  float powerKw = 2.45 + ((float)(random(-20, 20)) / 100.0);
  pPowerCharacteristic->setValue((uint8_t*)&powerKw, 4);
  pPowerCharacteristic->notify();
  delay(1000);
}
`;

export class VirtualBleDevice {
  private timer: any = null;
  private isConnected = false;
  private onReadingCallback: ((reading: { powerKw: number; currentAmps: number; tempC: number; batteryPct: number }) => void) | null = null;

  connect(
    mappedEquipmentId: string,
    onReading: (reading: { powerKw: number; currentAmps: number; tempC: number; batteryPct: number }) => void
  ): BleDevice {
    this.isConnected = true;
    this.onReadingCallback = onReading;

    const device: BleDevice = {
      id: 'virt_esp32_01',
      kind: 'virtual',
      name: 'ESP32-Meter-01 (Virtual BLE)',
      rssi: -52,
      battery: 89,
      mappedEquipmentId,
      status: 'connected',
      lastSeen: new Date().toISOString(),
      sampleRateHz: 1,
    };

    if (this.timer) clearInterval(this.timer);
    let baseKw = 34.2;
    this.timer = setInterval(() => {
      if (!this.isConnected) return;
      const noise = (Math.random() - 0.5) * 1.5;
      baseKw = Math.max(10, baseKw + noise);
      this.onReadingCallback?.({
        powerKw: parseFloat(baseKw.toFixed(2)),
        currentAmps: parseFloat(((baseKw * 1000) / (415 * 1.732 * 0.9)).toFixed(1)),
        tempC: parseFloat((44.5 + (Math.random() - 0.5) * 0.4).toFixed(1)),
        batteryPct: 89,
      });
    }, 1200);

    return device;
  }

  disconnect() {
    this.isConnected = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const virtualBle = new VirtualBleDevice();
