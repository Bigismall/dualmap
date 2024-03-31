export const log = (...messages: unknown[]) => {
    if (import.meta.env.PROD) {
        return;
    }
    console.log(...messages);
};

export const warn = (...messages: unknown[]) => {
    if (import.meta.env.PROD) {
        return;
    }
    console.warn(...messages);
};

export const fault = (...messages: unknown[]) => {
    if (import.meta.env.PROD) {
        return;
    }
    console.error(...messages);
};