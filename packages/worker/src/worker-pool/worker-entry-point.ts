import { ErrorHandler } from '../error-handler'
import {
  Logger,
  TaskHandler,
  WorkerEntryPoint as IWorkerEntryPoint,
  ErrorSerializer,
  EntryPointOptions,
  TaskProgress
} from '../typings'
import { AllOutgoingMessages, IncomingMessage, isStartTask } from './communication'

export abstract class WorkerEntryPoint<I, O, P = void> implements IWorkerEntryPoint<I, O, P> {
  private _handlers: TaskHandler<I, O, P>[] = []

  private errorHandler: ErrorSerializer

  constructor(config?: EntryPointOptions) {
    this.errorHandler = config?.errorHandler ?? new ErrorHandler()
  }

  abstract isMainWorker: () => boolean
  abstract messageMain: (msg: any) => void
  abstract listenMain: (event: 'message', l: (msg: any) => void) => void

  public async initialize() {
    if (this.isMainWorker()) {
      throw new Error("Can't create a worker entry point inside the main worker.")
    }

    const readyResponse: IncomingMessage<'worker_ready', O, P> = {
      type: 'worker_ready',
      payload: {}
    }
    this.messageMain(readyResponse)

    const messageHandler = async (msg: AllOutgoingMessages<I>) => {
      if (isStartTask(msg)) {
        for (const handler of this._handlers) {
          await this._runHandler(handler, msg.payload.input)
        }
      }
    }
    this.listenMain('message', messageHandler)
  }

  public listenForTask(handler: TaskHandler<I, O, P>) {
    this._handlers.push(handler)
  }

  private _runHandler = async (handler: TaskHandler<I, O, P>, input: I) => {
    try {
      const progress = ((p: number, data: P) => {
        const progressResponse: IncomingMessage<'task_progress', O, P> = {
          type: 'task_progress',
          payload: { progress: p, data }
        }
        this.messageMain(progressResponse)
      }) as TaskProgress<I, O, P>

      const output: O = await handler({
        input,
        logger: this.logger,
        progress
      })

      const doneResponse: IncomingMessage<'task_done', O, P> = {
        type: 'task_done',
        payload: {
          output
        }
      }
      this.messageMain(doneResponse)
    } catch (thrown) {
      const err = thrown instanceof Error ? thrown : new Error(`${thrown}`)
      const errorResponse: IncomingMessage<'task_error', O, P> = {
        type: 'task_error',
        payload: {
          error: this.errorHandler.serializeError(err)
        }
      }
      this.messageMain(errorResponse)
    }
  }

  public logger: Logger = {
    debug: (msg: string) => {
      const response: IncomingMessage<'log', O, P> = {
        type: 'log',
        payload: { log: { debug: msg } }
      }
      this.messageMain(response)
    },
    info: (msg: string) => {
      const response: IncomingMessage<'log', O, P> = {
        type: 'log',
        payload: { log: { info: msg } }
      }
      this.messageMain(response)
    },
    warning: (msg: string, err?: Error) => {
      const warning = err ? `${msg} ${err.message}` : msg
      const response: IncomingMessage<'log', O, P> = {
        type: 'log',
        payload: { log: { warning } }
      }
      this.messageMain(response)
    },
    error: (msg: string, err?: Error) => {
      const error = err ? `${msg} ${err.message}` : msg
      const response: IncomingMessage<'log', O, P> = { type: 'log', payload: { log: { error } } }
      this.messageMain(response)
    },
    sub: (namespace: string) => {
      return this.logger // TODO: allow this
    }
  }
}
