#!/usr/bin/env sh
set -eu
mkdir -p qa-reports
npm run test:unit
npm run test:integration
npm run test:e2e
npm run qa:lighthouse
