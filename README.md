# Daily Planner 🌷

A calm, simple daily checklist and self-care planner built with React and Vite. Track the things you need to do, how you feel, and the small details that make up your day. ☀️

Website URL- https://dailyplanner-lovat.vercel.app/ 

<img width="950" height="467" alt="image" src="https://github.com/user-attachments/assets/d5947e0d-4806-45f5-941e-f1d1f316c8e2" />
<img width="947" height="434" alt="image" src="https://github.com/user-attachments/assets/9b867854-22e1-4372-8308-c1959ad941c1" />
<img width="948" height="434" alt="image" src="https://github.com/user-attachments/assets/5dbeb513-6952-4c8d-a1f6-5c70d129f2b5" />
<img width="644" height="439" alt="image" src="https://github.com/user-attachments/assets/88589b86-b3db-4e9a-8e77-b84e8c719b9d" />

 ## Features 🎀

- Add tasks with high, medium, or low priority.
- Mark tasks complete, update their priority, or remove them.
- Track your mood and sleep quality.
- Record sleep hours and how rested you feel.
- Track water one glass at a time with unlimited `+` increments.
- Record workouts, exercise minutes, and steps.
- Keep gratitude notes, general notes, and plans for tomorrow. 
- Track meals, snacks, money in, and money out.
- Navigate between today and previous dates.
- Review saved days in the history view.
- Persist planner data in the browser with `localStorage`.
- Responsive layout for desktop and mobile screens.

## Tech Stack

- React 19
- Vite 8
- JavaScript
- ESLint
- CSS

## Getting Started

### Requirements

- Node.js 20 or newer
- npm

### Install

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local URL shown by Vite, usually `http://localhost:5173/`.

### Create a production build

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

### Run lint checks

```bash
npm run lint
```

## Data Storage

Planner entries are stored locally in the browser using `localStorage` under the key `cute-daily-planner-v1`. No account or backend service is required, and the data stays on the device and browser where it was created.

Clearing browser site data will remove saved planner entries. To move data to another browser or device, export and import support would need to be added.

## Project Structure

```text
.
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
└── src/
    ├── App.jsx       # Planner UI and state management
    ├── App.css       # Planner styles
    ├── index.css     # Global entry styles
    └── main.jsx      # React application entry point
```

## Development Notes

The root project is the active application. The `daily-planner/` directory is a separate Vite starter project created during setup and is not used by the root npm scripts.

## License

Add a license before publishing if this project will be shared or reused publicly.
