<div align="center">

  <img src="https://img.shields.io/badge/Status-Active%20Development-success?style=for-the-badge&logo=github&logoColor=white" alt="Status">
  <img src="https://img.shields.io/badge/React-19.2.0-blue?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.8.3-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4.2.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/TensorFlow-4.22.0-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow">

  <h1 align="center">
    <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f357/512.gif" width="40" alt="Meal">
    <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
      Meal-mate
    </span>
    <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f344/512.gif" width="40" alt="Mate">
  </h1>

  <p align="center">
    <em>Your Intelligent Nutrition Companion</em>
  </p>

  <p align="center">
    <strong>AI-Powered Meal Tracking • Real-time Nutrition Analysis • Smart Menu Assistant</strong>
  </p>

  <p align="center">
    <a href="#-features">Features</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-roadmap">Roadmap</a>
  </p>

</div>

---

## 🚀 Overview

**Meal-mate** is a cutting-edge nutrition management application designed to revolutionize how you track and analyze your daily food intake. Combining the power of on-device AI, real-time data synchronization, and an intuitive user interface, Meal-mate delivers a seamless experience for health-conscious individuals.

### 🎯 Core Philosophy

- **Privacy-First**: AI food recognition runs entirely on your device—no image uploads required
- **Real-Time Sync**: Seamless integration with cloud storage for data persistence
- **Intelligent Assistance**: AI-powered chatbot to answer menu queries instantly
- **Beautiful Design**: Modern, responsive UI built with industry-leading design systems

---

## ✨ Features

### 🤖 AI Food Scanner
- **On-Device Machine Learning**: Uses TensorFlow.js with MobileNet for instant food recognition
- **Privacy Preserving**: All image processing happens locally on your device
- **Multi-Source Nutrition Data**: Combines menu database with Open Food Facts API
- **Scan History**: Maintains local history of scanned items for quick reference
- **Confidence Scoring**: Provides match confidence percentages for accurate identification

### 📊 Nutrition Dashboard
- **Real-Time Tracking**: Live updates of daily calorie and macro intake
- **Visual Progress**: Beautiful ring charts and progress bars for goal tracking
- **Macro Breakdown**: Detailed tracking of Protein, Carbs, Fat, and Fiber
- **Weekly Trends**: Interactive charts showing 7-day calorie trends
- **Custom Goals**: Personalizable nutrition targets based on your needs

### 🍽️ Smart Menu System
- **Weekly Meal Plans**: Complete weekly menu with breakfast, lunch, snacks, and dinner
- **Pre-Ordering**: Plan your meals ahead with tomorrow's pre-order feature
- **Meal Logging**: One-tap logging of menu items to your daily tracker
- **Nutritional Labels**: Each item displays complete nutritional information
- **Dietary Tags**: High-protein, high-fiber, low-calorie, and other dietary indicators

### 💬 Intelligent Chat Assistant
- **Natural Language Queries**: Ask questions about menu, timings, and nutrition in plain English
- **Smart Recommendations**: Get personalized suggestions for weight loss and healthy eating
- **Quick Actions**: Pre-built questions for instant answers
- **Context-Aware**: Understands meal types, days, and dietary preferences

### 📱 Modern PWA Experience
- **Mobile-First Design**: Optimized for mobile devices with touch-friendly interfaces
- **Offline Support**: Core functionality works without internet connection
- **Smooth Animations**: Beautiful transitions and micro-interactions
- **Dark/Light Mode**: Automatic theme switching based on system preferences

---

## 🏗️ Architecture

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Meal-mate System                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │   Client     │    │   Browser    │    │   Cloud      │     │
│  │   (React)    │◄──►│   Storage    │◄──►│  (Supabase)  │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│         │                   │                   │                │
│         │                   │                   │                │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐        │
│  │ TensorFlow  │    │  Local      │    │   User      │        │
│  │     JS      │    │  Storage    │    │   Auth      │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                                      │                │
│         │                                      │                │
│  ┌──────▼──────┐                      ┌──────▼──────┐          │
│  │  MobileNet  │                      │   Meal      │          │
│  │   Model     │                      │   Logs      │          │
│  └─────────────┘                      └─────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
src/
├── components/          # Reusable UI Components
│   ├── ui/             # shadcn/ui components (45+ components)
│   ├── AuthPill.tsx    # Authentication status indicator
│   ├── BottomNav.tsx   # Mobile navigation bar
│   ├── MacroBars.tsx   # Macro nutrient progress bars
│   ├── MealCard.tsx    # Individual meal item card
│   ├── NutritionRing.tsx # Circular nutrition progress
│   ├── PageTransition.tsx # Page transition animations
│   └── WeeklyChart.tsx # Weekly calorie trend chart
│
├── hooks/              # Custom React Hooks
│   └── useNutritionData.ts # Nutrition data management
│
├── integrations/       # Third-party Integrations
│   ├── lovable/        # Lovable AI integration
│   └── supabase/       # Supabase client & auth
│
├── lib/                # Core Business Logic
│   ├── chatbot.ts      # AI chatbot logic
│   ├── foodScanner.ts  # AI food recognition
│   ├── menuData.ts     # Menu database & utilities
│   ├── storage.ts      # Local storage management
│   └── utils.ts        # Utility functions
│
├── routes/             # Page Routes (TanStack Router)
│   ├── index.tsx       # Dashboard
│   ├── scan.tsx        # AI Food Scanner
│   ├── chat.tsx        # Chat Assistant
│   ├── menu.tsx        # Weekly Menu
│   ├── meal-log.tsx    # Meal History
│   └── pre-order.tsx   # Pre-order System
│
├── router.tsx          # Router Configuration
└── start.ts            # Application Entry Point
```

### Data Flow Diagram

```
User Action
    │
    ├─► Scan Food Image
    │       │
    │       ├─► Load MobileNet Model (TensorFlow.js)
    │       │       │
    │       │       └─► Classify Image (On-Device)
    │       │               │
    │       │               ├─► Search Menu Database
    │       │               │       │
    │       │               │       └─► Match Found? → Return Nutrition
    │       │               │
    │       │               └─► Query Open Food Facts API
    │       │                       │
    │       │                       └─► Return Nutrition Data
    │       │
    │       └─► Display Results + Add to History
    │
    ├─► Log Meal
    │       │
    │       ├─► Update Local Storage
    │       │       │
    │       │       └─► Dispatch 'mealops:update' Event
    │       │
    │       └─► Sync to Supabase (if authenticated)
    │
    ├─► Chat Query
    │       │
    │       ├─► Process Natural Language
    │       │       │
    │       │       ├─► Match Intent Patterns
    │       │       │       │
    │       │       │       └─► Execute Handler Function
    │       │       │               │
    │       │       │               └─► Return Response
    │       │       │
    │       │       └─► Fuzzy Search Menu Items
    │       │               │
    │       │               └─► Return Item Details
    │       │
    │       └─► Display Chat Response
    │
    └─► View Dashboard
            │
            ├─► Load Today's Menu
            │       │
            │       └─► Calculate Daily Nutrition
            │               │
            │               └─► Update UI Components
            │
            └─► Load User Goals
                    │
                    └─► Compare vs Actual Intake
                            │
                            └─► Render Progress Charts
```

### Technology Stack Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Presentation Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  React 19.2.0  │  TanStack Router  │  Tailwind CSS 4.2.1       │
│  Framer Motion │  shadcn/ui         │  Radix UI Components      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Business Logic Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  TanStack Query  │  React Hook Form  │  Zod Validation          │
│  Custom Hooks    │  Chatbot Logic    │  Food Scanner Logic      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Data & AI Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  TensorFlow.js  │  MobileNet Model  │  Open Food Facts API     │
│  Local Storage   │  Supabase Client  │  Fuse.js (Fuzzy Search)  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Infrastructure Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  Vite 7.3.1      │  TypeScript 5.8.3  │  Cloudflare Workers     │
│  Supabase Auth   │  Supabase DB       │  MCP Protocol           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend Framework
- **React 19.2.0**: Latest React with concurrent features
- **TypeScript 5.8.3**: Type-safe development
- **TanStack Router 1.168.0**: Modern file-based routing with type safety
- **TanStack Start 1.167.14**: Full-stack React framework
- **TanStack Query 5.83.0**: Powerful data fetching and caching

### UI & Styling
- **Tailwind CSS 4.2.1**: Utility-first CSS framework
- **shadcn/ui**: Beautiful, accessible component library
- **Radix UI**: Unstyled, accessible UI primitives
- **Framer Motion 12.38.0**: Production-ready motion library
- **Lucide React 0.575.0**: Consistent icon library
- **Recharts 3.8.1**: Composable charting library

### AI & Machine Learning
- **TensorFlow.js 4.22.0**: Machine learning in JavaScript
- **MobileNet 2.1.1**: Pre-trained image classification model
- **Fuse.js 7.3.0**: Lightweight fuzzy search library

### Backend & Database
- **Supabase 2.110.6**: Open-source Firebase alternative
  - Authentication
  - Real-time Database
  - Storage
- **Cloudflare Workers**: Edge computing platform

### Development Tools
- **Vite 7.3.1**: Next-generation frontend tooling
- **ESLint 9.32.0**: Code linting and formatting
- **Prettier 3.7.3**: Code formatting
- **Bun**: Fast JavaScript runtime and package manager

### Additional Libraries
- **React Hook Form 7.71.2**: Performant form handling
- **Zod 3.24.2**: TypeScript-first schema validation
- **date-fns 4.1.0**: Modern date utility library
- **Sonner 2.0.7**: Beautiful toast notifications
- **canvas-confetti 1.9.4**: Confetti animations

---

## 📦 Installation

### Prerequisites
- Node.js 18+ or Bun runtime
- Git
- Supabase account (for cloud features)

### Clone the Repository

```bash
git clone https://github.com/Vishallakshmikanthan/Meal-mate.git
cd Meal-mate
```

### Install Dependencies

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Development Server

```bash
# Using Bun
bun run dev

# Or using npm
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Using Bun
bun run build

# Or using npm
npm run build
```

### Preview Production Build

```bash
# Using Bun
bun run preview

# Or using npm
npm run preview
```

---

## 🎯 Usage

### AI Food Scanner

1. Navigate to the **Scan** page
2. Tap the camera icon or upload an image
3. The AI will automatically identify the food item
4. View nutritional information and confidence score
5. Log the meal to your daily tracker

### Dashboard Navigation

- **Home**: View today's menu, nutrition stats, and quick actions
- **Scan**: AI-powered food recognition
- **Chat**: Ask questions about menu, timings, and nutrition
- **Menu**: View complete weekly meal plan
- **Log**: View meal history and trends
- **Pre-order**: Plan tomorrow's meals

### Chat Assistant

Ask natural language questions like:
- "What's for lunch today?"
- "Which days have chicken?"
- "High protein options?"
- "Mess timings?"
- "What's special on Sunday?"

---

## 🔒 Privacy & Security

### Data Privacy
- **Local Processing**: All AI food recognition happens on your device
- **No Image Uploads**: Food images are never sent to external servers
- **Encrypted Storage**: User data encrypted in transit and at rest
- **GDPR Compliant**: Built with privacy-by-design principles

### Authentication
- **Supabase Auth**: Secure authentication system
- **Session Management**: Automatic token refresh and session handling
- **OAuth Support**: Multiple authentication providers available

---

## 🗺️ Roadmap

### Phase 1: Core Features ✅ (Completed)
- [x] AI Food Scanner with MobileNet
- [x] Nutrition Dashboard
- [x] Weekly Menu System
- [x] Chat Assistant
- [x] Meal Logging
- [x] Pre-ordering System

### Phase 2: Enhanced Features 🚧 (In Progress)
- [ ] User Profile & Settings
- [ ] Advanced Nutrition Analytics
- [ ] Meal Recommendations Engine
- [ ] Social Sharing Features
- [ ] Barcode Scanner Integration
- [ ] Water Tracking

### Phase 3: Advanced Architecture 🔮 (Planned)
- [ ] Multi-language Support
- [ ] Offline-First Architecture
- [ ] Advanced AI Models (Custom Training)
- [ ] Integration with Fitness Trackers
- [ ] Meal Planning Algorithms
- [ ] Grocery List Generation
- [ ] Recipe Suggestions

### Phase 4: Ecosystem 🌟 (Future)
- [ ] Mobile Apps (iOS/Android)
- [ ] Smart Watch Integration
- [ ] API for Third-Party Integrations
- [ ] Community Features
- [ ] Premium Subscription Tier

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Reporting Bugs
- Use the GitHub Issues tab
- Provide detailed reproduction steps
- Include environment information

### Suggesting Features
- Open a feature request on GitHub
- Describe the use case clearly
- Provide examples if possible

### Submitting Pull Requests
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 👥 Team & Credits

### 🌟 Project Leadership
- **Idea Formulated By**: [Vishal Lakshmikanthan](https://github.com/Vishallakshmikanthan)
  - Conceptual vision and product strategy
  - Core feature definition
  - User experience design

### 🎨 Design & Implementation
- **Frontend Design Implemented By**: [Lovable AI](https://lovable.dev)
  - Modern UI/UX design
  - Component architecture
  - Visual design system

### 🏗️ Architecture & Development
- **Current Development**: Active construction for deeper and advanced tech architecture
  - Scalable backend infrastructure
  - Advanced AI/ML integration
  - Performance optimization
  - Security enhancements

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **TensorFlow.js Team**: For making ML accessible in the browser
- **Supabase**: For the excellent backend infrastructure
- **shadcn/ui**: For the beautiful component library
- **TanStack**: For the amazing router and query libraries
- **Open Food Facts**: For the comprehensive nutrition database

---

## 📞 Support

- **GitHub Issues**: [Report bugs and request features](https://github.com/Vishallakshmikanthan/Meal-mate/issues)
- **Discussions**: [Join community discussions](https://github.com/Vishallakshmikanthan/Meal-mate/discussions)
- **Email**: [Contact the team](mailto:support@meal-mate.app)

---

<div align="center">

  <p>
    <strong>Built with ❤️ by the Meal-mate Team</strong>
  </p>

  <p>
    <em>Empowering healthier eating through intelligent technology</em>
  </p>

  <img src="https://img.shields.io/badge/Status-Under%20Construction-orange?style=for-the-badge" alt="Under Construction">
  <img src="https://img.shields.io/badge/Development-Active-success?style=for-the-badge" alt="Active Development">
  <img src="https://img.shields.io/badge/Updates-Constant-blue?style=for-the-badge" alt="Constant Updates">

</div>
