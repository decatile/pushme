import fastify from "fastify";

const app = fastify({ logger: { level: "debug" } });

app
  .route({
    url: "/",
    method: "get",
    handler: (_, reply) => reply.send("Hello, world!"),
  })
  .listen({
    host: process.env.SERVER_HOST || "0.0.0.0",
    port: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 8080,
  });
