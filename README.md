# CC-Cheker Web Gateway — Backend scaffold

This branch contains the initial backend scaffold (TypeScript, Express) for the CC-Cheker Web Gateway project.

What is included:
- TypeScript + Express server
- Postgres integration (pg)
- Docker and docker-compose for local dev (includes Postgres service)
- Placeholder routes for Flutterwave integration and gateways

Quick start (local with docker-compose):
1. Copy .env.example to .env and adjust values
2. docker-compose up --build
3. Open http://localhost:3000/api/health

Vercel deployment:
- This scaffold is compatible with Vercel serverless functions; see README/DEPLOYMENT notes for adapting to serverless.

Next steps:
- Implement migrations, seed data, and gateway adapters
- Add Telegram bot integration and analytics dashboard
- Add payment webhooks and test with Flutterwave sandbox keys

