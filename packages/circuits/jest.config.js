module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '\\.[jt]s?$': 'ts-jest',
  },
  testTimeout: 100000,
};
