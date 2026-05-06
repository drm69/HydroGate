# HydroGate

HydroGate adalah sistem monitoring pintu bendungan berbasis IoT yang terintegrasi dengan AWS DynamoDB dan dashboard web modern menggunakan Next.js.

Project ini memungkinkan monitoring kondisi air secara real-time menggunakan sensor ultrasonic, kontrol servo gate, monitoring buzzer dan LED, serta visualisasi data melalui dashboard interaktif.

---

# Features

## Real-time Monitoring

* Monitoring level air secara realtime
* Menampilkan jarak sensor ultrasonic
* Status sistem otomatis
* Status buzzer dan LED
* Monitoring posisi servo gate

## Dashboard Monitoring

* Dashboard modern dengan Next.js + TailwindCSS
* Visualisasi data sensor
* Status card realtime
* Activity monitoring
* Alert system
* Responsive UI

## AWS Integration

* DynamoDB integration
* REST API menggunakan Next.js Route Handler
* Secure environment configuration
* CI/CD support menggunakan GitHub Actions

## Authentication

* Firebase Authentication
* Protected dashboard route
* Login system

---

# Tech Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Lucide React

## Backend & Cloud

* AWS DynamoDB
* AWS SDK v3
* Next.js API Route

## Authentication

* Firebase Authentication
* NextAuth

## IoT

* ESP32 / Wokwi Simulation
* Ultrasonic Sensor
* Servo Motor
* LED & Buzzer

---

# Project Structure

```bash
src/
├── app/
│   ├── api/
│   │   └── dynamodb/
│   │       └── route.ts
│   ├── dashboard/
│   │   ├── components/
│   │   └── page.tsx
│   └── auth/
├── components/
└── lib/
```

---

# Environment Variables

Buat file `.env.local` di root project.

```env
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
DYNAMODB_TABLE_NAME=YOUR_TABLE_NAME

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXTAUTH_SECRET=
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/your-username/hydrogate.git
cd hydrogate
```

## Install Dependencies

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di:

```bash
http://localhost:3000
```

---

# DynamoDB Integration

HydroGate menggunakan AWS DynamoDB untuk menyimpan data monitoring IoT.

Contoh struktur data:

```json
{
  "device_id": "HG-01",
  "jarak_cm": 12.5,
  "led_status": "ON",
  "servo_angle": 90,
  "buzzer": false,
  "button_pressed": false,
  "system_on": true,
  "source": "real"
}
```

---

# API Endpoint

## Get DynamoDB Data

```http
GET /api/dynamodb
```

Response:

```json
{
  "items": []
}
```

---

# CI/CD

Project menggunakan GitHub Actions untuk:

* Install dependencies
* Lint checking
* Build validation

Workflow file:

```bash
.github/workflows/ci.yml
```

---

# AWS Setup

## Create IAM User

Gunakan IAM User, jangan menggunakan root account.

Permission minimum:

```text
AmazonDynamoDBFullAccess
```

---

# Firebase Setup

1. Buat Firebase Project
2. Enable Authentication
3. Tambahkan Firebase Web App
4. Copy Firebase config ke `.env.local`

---

# Future Improvements

* Realtime chart visualization
* MQTT integration
* Notification system
* Machine learning flood prediction
* Mobile responsive optimization
* Multi-device support

---

# Contributors

HydroGate Team

---

# License

This project is licensed for educational and research purposes.
