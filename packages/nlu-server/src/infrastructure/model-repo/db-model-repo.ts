import * as NLUEngine from '@botpress/nlu-engine'
import { Logger } from '@bpinternal/log4bot'
import Bluebird from 'bluebird'
import { Knex } from 'knex'
import _ from 'lodash'
import { createTableIfNotExists } from '../database-utils'
import { ModelRepository, PruneOptions } from './typings'

const TABLE_NAME = 'nlu_models'
const { modelIdService } = NLUEngine

type TableKey = {
  appId: string
  modelId: string
}

type TableRow = {
  content: Buffer
  updatedOn: string
} & TableKey

type Column = keyof TableRow

type Result<C extends Readonly<Column[]>> = {
  [c in C[number]]: TableRow[c]
}

export class DbModelRepository implements ModelRepository {
  private _logger: Logger

  constructor(private _database: Knex, logger: Logger) {
    this._logger = logger.sub('model-repo')
  }

  private get table() {
    return this._database.table<TableRow>(TABLE_NAME)
  }

  public async initialize() {
    this._logger.debug('Model repo initializing...')
    await createTableIfNotExists(this._database, TABLE_NAME, (table: Knex.CreateTableBuilder) => {
      table.string('appId').notNullable()
      table.string('modelId').notNullable()
      table.binary('content').notNullable()
      table.timestamp('updatedOn').notNullable()
      table.primary(['appId', 'modelId'])
    })
  }

  public async teardown() {
    this._logger.debug('Model repo teardown...')
    return this._database.destroy()
  }

  public async getModel(appId: string, modelId: NLUEngine.ModelId): Promise<Buffer | undefined> {
    const stringId = modelIdService.toString(modelId)
    const filter: Partial<TableRow> = { appId, modelId: stringId }
    const row = await this.table.select('*').where(filter).first()
    if (!row) {
      return
    }

    const { content } = row
    return Buffer.from(content)
  }

  public async saveModel(appId: string, modelId: NLUEngine.ModelId, modelBuffer: Buffer): Promise<void | void[]> {
    const modelExists = await this.exists(appId, modelId)
    const stringId = modelIdService.toString(modelId)
    const iso = new Date().toISOString()
    if (modelExists) {
      const filter: TableKey = { appId, modelId: stringId }
      const row: Partial<TableRow> = { content: modelBuffer, updatedOn: iso }
      await this.table.update(row).where(filter)
      return
    }
    const row: TableRow = { appId, modelId: stringId, content: modelBuffer, updatedOn: iso }
    return this.table.insert(row)
  }

  public async listModels(appId: string, filters: Partial<NLUEngine.ModelId> = {}): Promise<NLUEngine.ModelId[]> {
    const rowfilters: Partial<TableKey> = { appId }
    const columns = ['appId', 'modelId', 'updatedOn'] as const
    const queryResult: Result<typeof columns>[] = await this.table.select(...columns).where(rowfilters)

    return _(queryResult)
      .orderBy(({ updatedOn }) => new Date(updatedOn).getTime(), 'asc')
      .map(({ modelId }) => modelIdService.fromString(modelId))
      .filter(filters)
      .value()
  }

  public async pruneModels(
    appId: string,
    options: PruneOptions,
    filters: Partial<NLUEngine.ModelId> = {}
  ): Promise<NLUEngine.ModelId[]> {
    const models = await this.listModels(appId, filters)
    const { keep } = options
    const toPrune = models.slice(keep)
    await Bluebird.each(toPrune, (m) => this.deleteModel(appId, m))
    return toPrune
  }

  public async exists(appId: string, modelId: NLUEngine.ModelId): Promise<boolean> {
    const stringId = modelIdService.toString(modelId)
    const filter: TableKey = { appId, modelId: stringId }
    const columns = ['appId', 'modelId'] as const
    const row: Result<typeof columns> | undefined = await this.table
      .select(...columns)
      .where(filter)
      .first()
    return !!row
  }

  public async deleteModel(appId: string, modelId: NLUEngine.ModelId): Promise<void> {
    const stringId = modelIdService.toString(modelId)
    const filter: TableKey = { appId, modelId: stringId }
    await this.table.delete().where(filter)
  }
}
