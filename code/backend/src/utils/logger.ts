import { env } from '../config/env';

const formatMessage = (level: 'INFO' | 'ERROR', message: string): string =>
  `[${level}] ${message}`;

export const logger = {
  info: (message: string): void => {
    const formattedMessage = formatMessage('INFO', message);

    if (env.isDevelopment) {
      console.log(formattedMessage);
      return;
    }

    console.log(formattedMessage);
  },
  error: (message: string): void => {
    console.error(formatMessage('ERROR', message));
  },
};
