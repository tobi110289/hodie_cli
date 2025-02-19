import Conf from 'conf';

const config = new Conf({
    projectName: 'hodie',
    defaults: {
        pomodoroLength: 25,
        pauseLength: 5,
        volume: 80,
        completedSessions: 0,
        lastSessionDate: null,
    }
});

export const getConfig = () => config;

export const updateConfig = (key, value) => {
    config.set(key, value);
};

export const resetSessionCount = () => {
    config.set('completedSessions', 0);
    config.set('lastSessionDate', new Date().toDateString());
};

export const incrementSessionCount = () => {
    const today = new Date().toDateString();
    const lastSessionDate = config.get('lastSessionDate');
    
    // Reset counter if it's a new day or first session ever
    if (!lastSessionDate || lastSessionDate !== today) {
        resetSessionCount();
        return 1;
    }

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