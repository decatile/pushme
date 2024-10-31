import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { Notification } from "../../db/entities";
import EventEmitter from "events";
import { intoNotificationDto, NotificationDto } from ".";
import { Deque } from "deque-typed";

declare module "fastify" {
  interface FastifyInstance {
    readonly notificationSSE: NotificationSSE;
  }
}

class Sink extends EventEmitter {
  deque = new Deque<[any, number]>();
  currentEventId = 0;

  constructor(public maxDequeLength: number) {
    super();
  }

  open(lastEventId = 0): void {
    this.deque
      .filter((x) => x[0] > lastEventId)
      .forEach((x) => this.doSend(...x));
  }

  send(kind: "new" | "edit", object: NotificationDto): void {
    const eventId = ++this.currentEventId;
    const data = { kind, object };
    this.deque.push([data, eventId]);
    if (this.deque.size > this.maxDequeLength) {
      this.deque.shift();
    }
    this.doSend(data, eventId);
  }

  private doSend(data: any, id: number) {
    this.emit("data", `data:${JSON.stringify(data)}\nid:${id}\n\n`);
  }
}

export class NotificationSSE {
  private idSinks: Record<number, Sink[]> = {};
  private tokenSinks: Record<string, Sink> = {};

  constructor(fastify: FastifyInstance, public bufferLength: number) {
    fastify.zod.get(
      "/notification/sse",
      {
        operationId: "notificationSSE",
        querystring: "sseQuerySchema",
      },
      async (request, reply) => {
        const { uid } = fastify.jwt.decode(request.query.token) as {
          uid: number;
        };
        const sink = this.getOrCreateSink(uid, request.query.token).on(
          "data",
          (string) => reply.raw.write(string)
        );
        reply.raw.once("close", () => sink.removeAllListeners("data"));
      }
    );
  }

  private getOrCreateSink(userId: number, token: string) {
    let sink = this.tokenSinks[token];
    if (!sink) {
      sink = new Sink(this.bufferLength);
      sink.once("destroy", () => this.deleteSink(userId, token));
      this.tokenSinks[token] = sink;
    }
    const sinks = this.idSinks[userId];
    if (!sinks) {
      this.idSinks[userId] = [sink];
    } else {
      sinks.push(sink);
    }
    sink.open();
    return sink;
  }

  private deleteSink(userId: number, token: string) {
    const sink = this.tokenSinks[token];
    delete this.tokenSinks[token];
    this.idSinks[userId] = this.idSinks[userId].filter((x) => x !== sink);
  }

  broadcast(userId: number, kind: "new" | "edit", notification: Notification) {
    this.idSinks[userId]?.forEach((x) => {
      x.send(kind, intoNotificationDto(notification));
    });
  }
}

export const notificationSSE: FastifyPluginCallback<{
  bufferLength: number;
}> = (fastify, { bufferLength }, next) => {
  fastify.decorate(
    "notificationSSE",
    new NotificationSSE(fastify, bufferLength)
  );
  next();
};
