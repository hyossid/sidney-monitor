import crossFetch from 'cross-fetch';
import { YQueue } from 'yqueue';

import { GraphQLClient } from 'graphql-request';
import {
  HASURA_GRAPHQL_ENDPOINT,
  X_HASURA_ADMIN_SECRET,
} from './config/secret';
import { getSdk } from './graphql/generated/graphql-request';
import logger from './logger';
import { sendAlert } from './notification';
const TOKEN_LIST = [
  'token-wbtc',
  'token-usda',
  'token-mia',
  'token-wstx',
  'token-xbtc',
  'token-diko',
  'token-wnycc',
];
async function start() {
  const queue = new YQueue({
    concurrency: 10,
  });

  const fetch: typeof crossFetch = (input, init) =>
    queue.run(async () => {
      const controller = new AbortController();
      let timeoutId: ReturnType<typeof setTimeout> | null = setTimeout(() => {
        logger.warn(`Graphql request timeout`);
        timeoutId = null;
        controller.abort();
      }, 30000);
      try {
        return await crossFetch(input, { ...init, signal: controller.signal });
      } finally {
        timeoutId && clearTimeout(timeoutId);
      }
    });
  const gql = new GraphQLClient(HASURA_GRAPHQL_ENDPOINT, {
    headers: {
      'x-hasura-role': 'admin',
      'x-hasura-admin-secret': X_HASURA_ADMIN_SECRET,
    },
    fetch,
  });
  const sdk = getSdk(gql);
  for (;;) {
    for (const token of TOKEN_LIST) {
      const coingeckoResult = await (
        await sdk.get_coingecko_data({ token })
      ).laplace_coin_gecko[0];

      const lastUpdate = new Date(coingeckoResult.timestamp).getTime();
      const now = new Date().getTime();
      const diff = now - lastUpdate;
      if (diff > 43200000) {
        console.log(
          'Coingecko not updated for 12hrs; sending alarm to telegram',
        );
        await sendAlert(
          `Token ${token} coingecko data not updated for more than 12 hrs`,
        );
      }
    }

    await new Promise(f => setTimeout(f, 60000));
  }
}

start().catch(e => logger.error('Fail to start alex-monitor', e));
