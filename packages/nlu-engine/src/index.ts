import _ from 'lodash'
import path from 'path'
import Engine from './engine'
import {
  TrainingAlreadyStartedError,
  TrainingCanceledError,
  LangServerError,
  DucklingServerError
} from './engine/errors'
import LanguageService from './language-service'
import _modelIdService from './model-id-service'
import { requireJSON } from './require-json'
import * as types from './typings'

const rootPkgDirectory = path.resolve(__dirname, '..')
const packageJsonPath = path.resolve(rootPkgDirectory, 'package.json')
const assetsPath = path.resolve(rootPkgDirectory, 'assets')
const packageJson = requireJSON<{ version: string }>(packageJsonPath)
if (!packageJson) {
  throw new Error('Could not find package.json at the root of nlu-engine.')
}

const { version: pkgVersion } = packageJson

export { SLOT_ANY, SYSTEM_ENTITIES } from './constants'

export const errors: typeof types.errors = {
  TrainingAlreadyStartedError,
  TrainingCanceledError,
  LangServerError,
  DucklingServerError
}

export const makeEngine: typeof types.makeEngine = async (config: types.Config, logger: types.Logger) => {
  const { ducklingEnabled, ducklingURL, languageURL, languageAuthToken, modelCacheSize, cachePath } = config
  const langConfig: types.LanguageConfig & { assetsPath: string } = {
    ducklingEnabled,
    ducklingURL,
    languageURL,
    languageAuthToken,
    assetsPath,
    cachePath
  }
  const engine = new Engine(pkgVersion, logger, { cacheSize: modelCacheSize })
  await engine.initialize(langConfig)
  return engine
}

export const modelIdService: typeof types.modelIdService = _modelIdService

export { LanguageService }
