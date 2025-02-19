# Hodie CLI

A productivity command-line interface suite featuring a Pomodoro timer, task tracker, and website blocker.

## Features

- 🍅 **Pomodoro Timer**
  - Interactive menu-driven interface
  - Configurable work and break durations
  - System notifications and sound alerts
  - Session tracking
  - Terminal title updates
  - Command-line arguments support

## Installation

### Via npm (globally)

```bash
npm install -g hodie
```

### Via Homebrew (requires xcode command line tools)

```bash
brew tap tobi110289/hodie
brew install hodie
```

## Usage

### Interactive Mode

Simply run:

```bash
hodie
```

This will open an interactive menu where you can:
- Start a Pomodoro timer
- Configure settings
- View other options

### Command Line Arguments

Start a Pomodoro timer directly:
```bash
hodie --pom 25    # Start a 25-minute timer
hodie --pom       # Start with default duration (25 minutes)
```

Configure break duration:
```bash
hodie --pause 10  # Set break duration to 10 minutes
```

### Settings

All settings are persisted in `~/.config/hodie/config.json` and include:
- Default Pomodoro duration
- Default break duration
- Notification volume
- Session tracking

## Development

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create symlink for local development:
```bash
npm link
```

## License

MIT 