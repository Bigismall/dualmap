const shouldLog = () => !import.meta.env.PROD;

export const log = (...messages: unknown[]) => {
  if (!shouldLog()) return;
  console.log(...messages);
};

export const warn = (...messages: unknown[]) => {
  if (!shouldLog()) return;
  console.warn(...messages);
};

export const fault = (...messages: unknown[]) => {
  if (!shouldLog()) return;
  console.error(...messages);
};
