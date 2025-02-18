import Conf from 'conf';

const config = new Conf({
    projectName: 'hodie',
    defaults: {
        pomodoroLength: 25,
        pauseLength: 5,
        volume: 80,
        completedSessions: 0,
    }
});

export const getConfig = () => config;

export const updateConfig = (key, value) => {
    config.set(key, value);
};

export const resetSessionCount = () => {
    config.set('completedSessions', 0);
};

export const incrementSessionCount = () => {
    const current = config.get('completedSessions');
    config.set('completedSessions', current + 1);
    return current + 1;
};

export default {
    getConfig,
    updateConfig,
    resetSessionCount,
    incrementSessionCount,
}; 