// jest.config.js
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['./projects/ngync/src/lib/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
};
