// jest.config.js
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['./projects/ngync/src/lib/setup-jest.ts'],
  testTimeout: 10000,
};
