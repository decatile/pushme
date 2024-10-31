import { FastifyInstance } from "fastify";
import { Notification } from "../../db/entities";
import EventEmitter from "events";
import { intoNotificationDto, NotificationDto, NotificationService } from ".";
import { Deque } from "deque-typed";

declare module "fastify" {
  interface FastifyInstance {
    readonly notificationSse: NotificationSse;
  }
}

class Sink extends EventEmitter<{ data: [string]; destroy: [] }> {
  deque: Deque<[any, number]>;
  currentEventId = 0;

  constructor(maxDequeLength: number) {
    super();
    this.deque = new Deque(undefined, { maxLen: maxDequeLength });
  }

  open(lastEventId = 0): void {
    this.deque.filter((x) => x[0] > lastEventId).forEach((x) => this.doSend(x));
  }

  send(
    kind: "all" | "new" | "edit",
    object: NotificationDto | NotificationDto[]
  ): void {
    const data = [{ kind, object }, ++this.currentEventId] as [any, number];
    this.deque.push(data);
    this.doSend(data);
  }

  doSend([data, id]: [any, number]) {
    this.emit("data", `data:${JSON.stringify(data)}\nid:${id}\n\n`);
  }
}

class NotificationSse {
  private idSinks: Record<number, Sink[]> = {};
  private tokenSinks: Record<string, Sink> = {};

  constructor(
    fastify: FastifyInstance,
    public bufferLength: number,
    public notificationService: NotificationService
  ) {
    fastify.zod.get(
      "/notification/sse",
      {
        operationId: "notificationSse",
        querystring: "sseQuerySchema",
      },
      async (request, reply) => {
        const { uid } = fastify.jwt.decode(request.query.token) as {
          uid: number;
        };
        reply.raw.writeHead(200, {
          "content-type": "text/event-stream",
          connection: "keep-alive",
          "cache-control": "no-cache",
        });
        const [sink, isNew] = this.getOrCreateSink(uid, request.query.token);
        sink.on("data", (string) => reply.raw.write(string));
        reply.raw.once("close", () => sink.removeAllListeners("data"));
        if (isNew) sink.send("all", await this.notificationService.getAll(uid));
      }
    );
  }

  private getOrCreateSink(userId: number, token: string) {
    let sink = this.tokenSinks[token];
    let isNewSink = !sink;
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
    return [sink, isNewSink] as [Sink, boolean];
  }

  private deleteSink(userId: number, token: string) {
    const sink = this.tokenSinks[token];
    delete this.tokenSinks[token];
    const sinks = this.idSinks[userId].filter((x) => x !== sink);
    if (sinks.length > 0) {
      this.idSinks[userId] = sinks;
    } else {
      delete this.idSinks[userId];
    }
  }

  broadcast(
    userId: number,
    kind: "all" | "new" | "edit",
    notification: Notification
  ) {
    this.idSinks[userId]?.forEach((x) => {
      x.send(kind, intoNotificationDto(notification));
    });
  }
}

export function registerNotificationSse(
  fastify: FastifyInstance,
  bufferLength: number,
  notificationService: NotificationService
) {
  fastify.decorate(
    "notificationSse",
    new NotificationSse(fastify, bufferLength, notificationService)
  );
}
