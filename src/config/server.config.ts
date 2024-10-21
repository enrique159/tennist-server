export default () => ({
  port: parseInt(process.env.PORT) || 3333,
  secretKey: process.env.SECRET_KEY || 'secret',
});
