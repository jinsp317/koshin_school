const path = require('path');

module.exports = {
  ENV: 'prod',
  KITTEN_PATH: path.resolve(__dirname, '../src/core/react-native-ui-kitten'),
  MAPPING_PATH: path.resolve(__dirname, '../src/core/@eva-design/eva'),
  PROCESSOR_PATH: path.resolve(__dirname, '../src/core/@eva-design/processor'),
};
