# Pomodoragon

A game that combines the Pomodoro Technique with city-building and resource management. Built with Next.js and TypeScript.

During work, your dwarves will work diligently to gather resources and improve their fortress city.

During breaks, you can raid the dragon's lair to ~steal~ liberate wondrous treasures!

## Features

- Pomodoro timer with work/break cycles
- Resource management (gold, gems, lumber, stone)
- Facility construction and upgrades
- Technology research system
- Population management
- Society focus allocation

## Getting Started

### Prerequisites

- Node.js 18.x or later
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pomodoragon.git
cd pomodoragon
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/src/app` - Next.js application code
  - `/components` - React components
  - `/data` - Game data and types
- `/public` - Static assets
  - `/audio` - Sound effects
  - `/images` - Game images and icons
- `/scripts` - Utility scripts for data conversion

## Development

### Data Management

The game uses CSV files to manage facility and technology data. To update the data:

1. Edit the CSV files in `/scripts`
2. Run the conversion scripts:
```bash
pnpm run convert-facilities
pnpm run convert-techs
```

### Building for Production

```bash
pnpm build
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
