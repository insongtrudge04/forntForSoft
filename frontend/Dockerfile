FROM node:22

WORKDIR /app

EXPOSE 3000

ENV NEXT_TELEMETRY_DISABLED=1

CMD ["sh", "-c", "cd frontend && npx next build && npx next start --port 3000"]
