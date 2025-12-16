/** @type {import('jest').Config} */
const config = {
  verbose: true,
  moduleDirectories: ['node_modules', 'src'],
  modulePaths: ['<rootDir>/'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  }
};

module.exports = config;