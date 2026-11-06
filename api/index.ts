import app from '../src/app';

// Vercel serverless entry point.
// The Express app is exported directly: @vercel/node turns it into the handler,
// so `app.listen` (used by src/server.ts for local dev) is never called here.
export default app;
