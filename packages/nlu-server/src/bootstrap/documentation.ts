import { Logger } from '@botpress/logger'
import chalk from 'chalk'
import { NLUServerOptions } from '../typings'

const GH_TRAIN_INPUT_EXAMPLE =
  'https://github.com/botpress/nlu/blob/master/packages/nlu-server/examples/train-example.json'
const NPM_NLU_CLIENT = 'https://www.npmjs.com/package/@botpress/nlu-client'

export const displayDocumentation = (logger: Logger, options: NLUServerOptions) => {
  const { host, port } = options
  const baseUrl = `http://${host}:${port}/`

  logger.info(chalk`

{bold {underline Important Routes}}

{green /**
 * Gets the current version of the NLU engine being used. Usefull to test if your installation is working.
 * @returns {bold info}: version and supported languages.
*/}
{bold GET ${baseUrl}/info}

{green /**
  * Starts a training.
  * @header {bold x-app-id} Application ID to make sure there's no collision between models of different applications.
  * @body_parameter {bold language} Language to use for training.
  * @body_parameter {bold intents} Intents definitions.
  * @body_parameter {bold contexts} All available contexts.
  * @body_parameter {bold entities} Entities definitions.
  * @body_parameter {bold seed} Number to seed random number generators used during training (beta feature). {yellow ** Optionnal **}
  * @returns {bold modelId} A model id for futur API calls
 */}
{bold POST ${baseUrl}/train}

{green /**
  * Gets a training progress status.
  * @header {bold x-app-id} Application ID to make sure there's no collision between models of different applications.
  * @path_parameter {bold modelId} The model id for which you seek the training progress.
  * @returns {bold session} A training state data structure with information on desired model.
 */}
{bold GET ${baseUrl}/train/:modelId}

{green /**
  * Cancels a training.
  * @header {bold x-app-id} Application ID to make sure there's no collision between models of different applications.
  * @path_parameter {bold modelId} The model id for which you want to cancel the training.
 */}
{bold POST ${baseUrl}/train/:modelId/cancel}

{green /**
  * Perform prediction for a text input.
  * @header {bold x-app-id} Application ID to make sure there's no collision between models of different applications.
  * @path_parameter {bold modelId} The model id you want to use for prediction.
  * @body_parameter {bold utterances} Array of text for which you want a prediction.
  * @returns {bold predictions} Array of predictions; Each prediction is a data structure reprensenting the understanding of the text.
 */}
{bold POST ${baseUrl}/predict/:modelId}

{bold For a complete example on training input, see
${GH_TRAIN_INPUT_EXAMPLE}}.

{bold If you plan on querying from a nodejs environment, see
${NPM_NLU_CLIENT}}.

{bold {yellow To hide this documentation, run program with arg --doc=false}}
    `)
}
