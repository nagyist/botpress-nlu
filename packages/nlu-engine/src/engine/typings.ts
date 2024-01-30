import _ from 'lodash'
import LRUCache from 'lru-cache'
import { LangServerSpecs } from 'src/typings'
import * as MLToolkit from '../ml/toolkit'

import { Predictors } from './predict-pipeline'

export const BIO = {
  INSIDE: 'I',
  BEGINNING: 'B',
  OUT: 'o'
} as _.Dictionary<Tag>

export type Tag = 'o' | 'B' | 'I'

export type Token2Vec = {
  [token: string]: number[]
}

export type LangServerInfo = {
  version: string
  domain: string
  dim: number
}

export type TFIDF = _.Dictionary<number>

export type PatternEntity = Readonly<{
  name: string
  pattern: string
  examples: string[]
  matchCase: boolean
  sensitive: boolean
}>

export type ListEntity = Readonly<{
  name: string
  synonyms: { [canonical: string]: string[] }
  fuzzyTolerance: number
  sensitive: boolean
}>

export type EntityCache = LRUCache<string, EntityExtractionResult[]>
export type EntityCacheDump = LRUCache.Entry<string, EntityExtractionResult[]>[]

export type ListEntityWithCache = ListEntity & {
  cache: EntityCacheDump
}

export type ListEntityModel = {
  type: 'custom.list'
  id: string
  entityName: string
  fuzzyTolerance: number
  sensitive: boolean
  /** @example { 'Air Canada': [ ['Air', '_Canada'], ['air', 'can'] ] } */
  mappingsTokens: _.Dictionary<string[][]>
}

export type ColdListEntityModel = ListEntityModel & {
  cache: EntityCacheDump
}

export type WarmedListEntityModel = ListEntityModel & {
  cache: EntityCache
}

export type ExtractedSlot = {
  confidence: number
  name: string
  source: string
  value: any
  entity?: EntityExtractionResult
}

export type SlotExtractionResult = {
  slot: ExtractedSlot
  start: number
  end: number
}
export type EntityExtractor = 'system' | 'list' | 'pattern'
export type ExtractedEntity = {
  confidence: number
  type: string
  metadata: {
    source: string
    entityId: string
    extractor: EntityExtractor
    unit?: string
    occurrence?: string
  }
  sensitive?: boolean
  value: string
}
export type EntityExtractionResult = ExtractedEntity & { start: number; end: number }

export type KeyedItem = {
  input: string
  idx: number
  entities?: EntityExtractionResult[]
}

export type SeededLodashProvider = {
  setSeed(seed: number): void
  getSeededLodash(): _.LoDashStatic
  resetSeed(): void
}

export type Tools = {
  getLanguages(): string[]
  getLangServerSpecs(): LangServerSpecs

  identify_language(utterance: string, predictorsByLang: _.Dictionary<Predictors>): Promise<string>

  tokenize_utterances(utterances: string[], languageCode: string, vocab?: string[]): Promise<string[][]>
  vectorize_tokens(tokens: string[], languageCode: string): Promise<number[][]>
  pos_utterances(utterances: string[][], languageCode: string): Promise<string[][]>

  getStopWordsForLang(lang: string): Promise<string[]>
  isSpaceSeparated(lang: string): boolean

  seededLodashProvider: SeededLodashProvider
  mlToolkit: typeof MLToolkit
  systemEntityExtractor: SystemEntityExtractor
}

export type SystemEntityExtractor = {
  extractMultiple(
    input: string[],
    lang: string,
    progress: (p: number) => void,
    useCache?: boolean
  ): Promise<EntityExtractionResult[][]>
  extract(input: string, lang: string): Promise<EntityExtractionResult[]>
}

export type Intent<T> = Readonly<{
  name: string
  contexts: string[]
  slot_definitions: SlotDefinition[]
  utterances: T[]
}>

export type SlotDefinition = Readonly<{
  name: string
  entities: string[]
}>

export type SerializedKmeansResult = Omit<MLToolkit.KMeans.KmeansResult, 'nearest'>
