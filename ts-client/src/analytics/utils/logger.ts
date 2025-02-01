

import debug from 'debug';

export const logger = {
  error: debug('analytics:error'),
  warn: debug('analytics:warn'),
  info: debug('analytics:info'),
  debug: debug('analytics:debug')
};