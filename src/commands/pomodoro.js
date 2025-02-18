import ora from "ora";
import chalk from "chalk";
import notifier from "node-notifier";
import player from "play-sound";
import { getConfig, incrementSessionCount } from "../utils/config.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import readline from "readline";

const audio = player();
const spinner = ora();

// Get the directory path for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set terminal title for macOS
const setTerminalTitle = (title) => {
  process.stdout.write(`\x1b]2;${title}\x07`);
};

// Helper function to wait for Enter key with double-press detection
const waitForEnter = async (promptMessage, allowQuickSkip = false) => {
  console.log(chalk.cyan(`\n${promptMessage}`));
  if (allowQuickSkip) {
    console.log(chalk.gray("(Press Enter twice quickly to skip the break)"));
  }
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let lastEnterTime = 0;
  let skipBreak = false;

  return new Promise((resolve) => {
    const cleanup = () => {
      rl.removeAllListeners();
      rl.close();
    };

    rl.on('line', () => {
      const now = Date.now();
      if (allowQuickSkip && lastEnterTime > 0 && now - lastEnterTime < 2000) {
        cleanup();
        resolve(true); // Skip break
      } else if (!allowQuickSkip || lastEnterTime === 0) {
        cleanup();
        resolve(false); // Don't skip break
      } else {
        lastEnterTime = now;
      }
    });

    rl.on('SIGINT', () => {
      cleanup();
      process.exit(0);
    });
  });
};

// Helper function to ask for confirmation with timeout
const askForConfirmationWithTimeout = async (message, timeoutMs = 5000) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  // Enable raw mode
  process.stdin.setRawMode(true);

  try {
    return await new Promise((resolve) => {
      let answered = false;
      
      const timeoutId = setTimeout(() => {
        if (!answered) {
          process.stdout.write(chalk.gray('\nContinuing break...\n'));
          resolve(false);
        }
      }, timeoutMs);

      process.stdout.write(chalk.yellow(`\n${message} (y/N, ${timeoutMs/1000}s timeout): `));

      const handleKeypress = (str, key) => {
        if (answered) return;

        // Handle Ctrl+C
        if (key.ctrl && key.name === 'c') {
          process.exit(0);
        }

        const input = str.toLowerCase();
        if (input === 'y' || input === 'n') {
          answered = true;
          clearTimeout(timeoutId);
          process.stdout.write(input + '\n');
          resolve(input === 'y');
        }
      };

      process.stdin.on('keypress', handleKeypress);
    });
  } finally {
    // Cleanup
    process.stdin.setRawMode(false);
    rl.close();
  }
};

export const startPomodoro = async (minutes = null) => {
  const config = getConfig();
  const initialDuration = minutes || config.get("pomodoroLength");
  const pauseDuration = config.get("pauseLength");
  const volume = config.get("volume");
  let currentDuration = initialDuration;

  // Setup process signal handlers
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\nExiting Hodie...'));
    process.exit(0);
  });

  // Function to play sound and show notification
  const notify = (message, isWork = true) => {
    // Get absolute path to sound files
    const soundFile = isWork ? "work-complete.mp3" : "break-complete.mp3";
    const soundPath = join(__dirname, "..", "assets", soundFile);

    // Play sound with error handling
    audio.play(soundPath, { volume: volume / 100 }, (err) => {
      if (err) {
        console.error("Error playing sound:", err);
      }
    });

    notifier.notify({
      title: "Hodie",
      message,
      sound: false, // We're handling sound separately
    });
  };

  while (true) { // Main loop for continuous pomodoro sessions
    // Start work period
    const startTime = Date.now();
    const endTime = startTime + currentDuration * 60 * 1000;

    spinner.start(chalk.blue(`Pomodoro timer started: ${currentDuration} minutes`));

    while (Date.now() < endTime) {
      const remaining = Math.ceil((endTime - Date.now()) / 1000);
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

      // Update terminal title and spinner text
      setTerminalTitle(`🍅 ${timeStr}`);
      spinner.text = chalk.blue(`Time remaining: ${timeStr}`);

      // Wait for 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const sessionCount = incrementSessionCount();
    setTerminalTitle(`🎯 Session ${sessionCount} done!`);
    spinner.succeed(chalk.green("Work period complete!"));
    notify(`🎯 Session ${sessionCount} done, time for a break!`, true);

    if (sessionCount % 4 === 0) {
      console.log(
        chalk.yellow(
          `\nThis was your ${sessionCount}th session! Consider taking a longer break.`
        )
      );
    }

    // Wait for user to start break, with quick skip option
    const skipBreak = await waitForEnter(`Press Enter to start your ${pauseDuration} minute break...`, true);

    if (skipBreak) {
      console.log(chalk.yellow("\nBreak skipped!"));
      setTerminalTitle(`⏭️ Break skipped`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause to show the skip message
    } else {
      // Start break period
      const breakStartTime = Date.now();
      let breakEndTime = breakStartTime + pauseDuration * 60 * 1000;
      let breakSkipped = false;
      let confirmationInProgress = false;

      spinner.start(chalk.blue(`Break timer started: ${pauseDuration} minutes`));
      console.log(chalk.gray("\n(Press Enter during break to skip)"));

      // Create readline interface for break skip detection
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      // Handle break skip
      rl.on('line', async () => {
        if (confirmationInProgress) return;
        confirmationInProgress = true;

        // Pause the timer display
        spinner.stop();
        
        const shouldSkip = await askForConfirmationWithTimeout("Are you sure you want to end the break early?");
        
        if (shouldSkip) {
          breakSkipped = true;
          breakEndTime = Date.now();
          rl.close();
        } else {
          confirmationInProgress = false;
          // Resume the timer display with current time
          const remaining = Math.ceil((breakEndTime - Date.now()) / 1000);
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;
          const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;
          
          spinner.start(chalk.blue(`Break time remaining: ${timeStr}`));
        }
      });

      // Handle Ctrl+C during break
      rl.on('SIGINT', () => {
        rl.close();
        console.log(chalk.yellow('\nExiting Hodie...'));
        process.exit(0);
      });

      // Main break timer loop
      while (Date.now() < breakEndTime && !breakSkipped) {
        if (!confirmationInProgress) {
          const remaining = Math.ceil((breakEndTime - Date.now()) / 1000);
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;
          const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

          setTerminalTitle(`☕️ ${timeStr}`);
          spinner.text = chalk.blue(`Break time remaining: ${timeStr}`);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      rl.removeAllListeners();
      rl.close();

      if (breakSkipped) {
        setTerminalTitle(`⏭️ Break ended early`);
        spinner.warn(chalk.yellow("Break ended early!"));
      } else {
        setTerminalTitle(`🌟 Break complete!`);
        spinner.succeed(chalk.green("Break complete!"));
      }
      notify("Break complete! Ready to start another session?", false);
    }

    // Wait for user to start next work period
    await waitForEnter(`Press Enter to start your next ${currentDuration} minute work session...`);
  }
};

export default {
  startPomodoro,
};
