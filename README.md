#  The Productivity App

Productivity App is a mobile-first PWA designed to help working students prevent burnout, stay organized, and build healthier study and work routines.

The project is built around the needs of **Alex**, a representative user persona who balances university deadlines, part-time work, personal responsibilities, and limited energy throughout the day.

## Tech Stack

- Vue 3
- TypeScript
- Pinia
- Tailwind CSS
- shadcn-vue
- Vite PWA

## Key Features

- **Pomodoro Timer** for focused work sessions and structured breaks
- **Task Management** with support for Tasks and Subtasks
- **Calendar View** for planning study, work, and personal commitments
- **Productivity Statistics** to help users reflect on progress and habits
- **Offline Mode (PWA)** so core functionality remains available on the go

## Project Links

The full project documentation, ideas, research, and technical specifications are maintained in Confluence.

- [Confluence: Project Documentation](https://mikhail-kucherenko.atlassian.net/wiki/spaces/~7120208debcf5ddca746299eb8d761cf0d5cef/overview)
- [Jira: Project Board](https://mikhail-kucherenko.atlassian.net/jira/software/projects/FP/boards/34)
- [Figma: Design Files](https://www.figma.com/design/KW9Qq2SbdHFWVG9GtSOozt/design?node-id=166-485&t=zEMhvssBqKT7Y4Db-1)

## Getting Started

Prerequisite: make sure `Node.js` and `npm` are installed on your machine.

1. Clone the repository:

```bash
git clone <repository-url>
cd productivityApp
```

2. Go to the frontend application:

```bash
cd frontend
```

3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

After that, Vite will start the local development server for the frontend application.

## Architecture & Principles

- **Component-based architecture**: the interface is built from reusable Vue components to keep the codebase maintainable and scalable.
- **Mobile-first design**: the product is designed primarily for smartphone usage, with layouts and interactions optimized for smaller screens first.
- **PWA-first mindset**: the app is intended to be installable, accessible, and usable in real everyday conditions, including unstable connectivity.
