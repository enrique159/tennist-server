export default {
  mongodbMemoryServerOptions: {
    instance: {
      dbName: 'tennist-test',
    },
    binary: {
      version: '4.0.3',
      skipMD5: true,
    },
    autoStart: false,
  },
};
