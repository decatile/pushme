import fastify from "fastify";
import { SERVER_HOST, SERVER_PORT } from "./config";
import "./data-source";
import dataSource, { User } from "./data-source";

(async () => {
  await dataSource.initialize();
  const userRepo = dataSource.getRepository(User);
  fastify({ logger: { level: "debug" } })
    .route({
      url: "/insert",
      method: "get",
      handler: async (_, rep) => {
        const user = new User(5634789);
        await userRepo.save(user);
        await rep.send({ ok: 1, user });
      },
    })
    .route({
      url: "/retrieve",
      method: "get",
      handler: async (_, rep) => rep.send(await userRepo.find()),
    })
    .listen({
      host: SERVER_HOST,
      port: SERVER_PORT,
    });
})();
