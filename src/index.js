#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { getConfig, updateConfig } from './utils/config.js';
import { startPomodoro } from './commands/pomodoro.js';

const program = new Command();

// Setup CLI program
program
    .name('hodie')
    .description('A productivity CLI suite')
    .version('1.0.0');

// Pomodoro command
program
    .option('--pom [minutes]', 'start a pomodoro timer')
    .option('--pause [minutes]', 'set the pause duration');

// Parse arguments
program.parse();
const options = program.opts();

const showSettingsMenu = async () => {
    const config = getConfig();
    const { setting } = await inquirer.prompt([
        {
            type: 'list',
            name: 'setting',
            message: 'What would you like to configure?',
            choices: [
                {
                    name: '⏱️  Default Pomodoro Duration',
                    value: 'pomodoro'
                },
                {
                    name: '☕️ Default Break Duration',
                    value: 'break'
                },
                {
                    name: '🔊 Notification Volume',
                    value: 'volume'
                },
                {
                    name: '↩️  Back to Main Menu',
                    value: 'back'
                }
            ]
        }
    ]);

    if (setting === 'back') {
        return showMainMenu();
    }

    if (setting === 'pomodoro') {
        const { duration } = await inquirer.prompt([
            {
                type: 'input',
                name: 'duration',
                message: 'Default pomodoro duration (minutes):',
                default: config.get('pomodoroLength').toString(),
                validate: input => !isNaN(input) && parseInt(input) > 0
            }
        ]);
        updateConfig('pomodoroLength', parseInt(duration));
        console.log(chalk.green(`Default pomodoro duration set to ${duration} minutes`));
    } else if (setting === 'break') {
        const { duration } = await inquirer.prompt([
            {
                type: 'input',
                name: 'duration',
                message: 'Default break duration (minutes):',
                default: config.get('pauseLength').toString(),
                validate: input => !isNaN(input) && parseInt(input) > 0
            }
        ]);
        updateConfig('pauseLength', parseInt(duration));
        console.log(chalk.green(`Default break duration set to ${duration} minutes`));
    } else if (setting === 'volume') {
        const { volume } = await inquirer.prompt([
            {
                type: 'input',
                name: 'volume',
                message: 'Notification volume (0-100):',
                default: config.get('volume').toString(),
                validate: input => !isNaN(input) && parseInt(input) >= 0 && parseInt(input) <= 100
            }
        ]);
        updateConfig('volume', parseInt(volume));
        console.log(chalk.green(`Notification volume set to ${volume}%`));
    }

    // After setting a value, go back to settings menu
    return showSettingsMenu();
};

const showMainMenu = async () => {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                {
                    name: '🍅 Start Pomodoro Timer',
                    value: 'pomodoro'
                },
                {
                    name: '⚙️  Configure Settings',
                    value: 'settings'
                },
                {
                    name: '❌ Exit',
                    value: 'exit'
                }
            ]
        }
    ]);

    if (action === 'exit') {
        process.exit(0);
    } else if (action === 'pomodoro') {
        const config = getConfig();
        const defaultLength = config.get('pomodoroLength');
        
        const { duration } = await inquirer.prompt([
            {
                type: 'input',
                name: 'duration',
                message: 'How many minutes?',
                default: defaultLength.toString(),
                validate: input => !isNaN(input) && parseInt(input) > 0
            }
        ]);

        startPomodoro(parseInt(duration));
    } else if (action === 'settings') {
        await showSettingsMenu();
    }
};

// Handle direct commands
if (options.pom !== undefined) {
    const minutes = options.pom === true ? null : parseInt(options.pom);
    startPomodoro(minutes);
} else if (options.pause !== undefined) {
    const minutes = parseInt(options.pause) || 5;
    updateConfig('pauseLength', minutes);
    console.log(chalk.green(`Pause duration set to ${minutes} minutes`));
} else {
    showMainMenu();
} 