import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const searchDuration = new Trend('search_duration', true);

export const options = {
  scenarios: {
    qa_load: {
      executor: 'constant-vus',
      vus: Number(__ENV.VUS || 50),
      duration: __ENV.DURATION || '30s'
    }
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
    errors: ['rate<0.01'],
    search_duration: ['p(95)<500']
  }
};

const BASE_URL = (__ENV.BASE_URL || 'https://TU-DOMINIO.com').replace(/\/$/, '');

export default function () {
  const health = http.get(`${BASE_URL}/api/health`, { tags: { endpoint: 'health' } });
  const healthOk = check(health, {
    'health status 200': (r) => r.status === 200,
    'health < 500 ms': (r) => r.timings.duration < 500
  });
  errorRate.add(!healthOk);

  const search = http.post(
    `${BASE_URL}/api/search`,
    JSON.stringify({ q: 'aceite', page: 1 }),
    { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'search' } }
  );
  searchDuration.add(search.timings.duration);
  const searchOk = check(search, {
    'search status 200': (r) => r.status === 200,
    'search response has items': (r) => Array.isArray(r.json('items')),
    'search < 500 ms': (r) => r.timings.duration < 500
  });
  errorRate.add(!searchOk);

  sleep(1);
}
