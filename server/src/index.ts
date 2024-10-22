import fastify from "fastify";

fastify()
  .route({
    url: "/",
    method: "get",
    handler: (_, reply) => reply.send("Hello, world!"),
  })
  .listen({
    host: process.env.SERVER_HOST,
    port: process.env.SERVER_PORT
      ? parseInt(process.env.SERVER_PORT)
      : undefined,
  })
  .then((addr) => console.log(`Listening at ${addr}`));
