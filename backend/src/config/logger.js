import pino from 'pino';
import { config } from './env.js';

const logger = pino({
    level: config.logLevel,
    ...(config.nodeEnv !== 'production' && {
        transport: {
            target: 'pino/file',
            options: { destination: 1 },
        },
    }),
});

export default logger;
