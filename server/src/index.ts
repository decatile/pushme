import fastify from "fastify";
import { SERVER_HOST, SERVER_PORT } from "./config";
import "./data-source";

fastify({ logger: { level: "debug" } })
  .route({
    url: "/",
    method: "get",
    handler: (_, reply) => reply.send("Hello, world!"),
  })
  .listen({
    host: SERVER_HOST,
    port: SERVER_PORT,
  });
