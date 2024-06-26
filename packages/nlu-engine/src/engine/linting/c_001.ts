import _ from 'lodash'
import {
  IntentDefinition,
  ListEntityDefinition,
  PatternEntityDefinition,
  SlotDefinition,
  TrainInput
} from 'src/typings'
import { SLOT_ANY, SYSTEM_ENTITIES } from '../../constants'
import { isListEntity, isPatternEntity } from '../../guards'
import { DatasetIssue, IssueDefinition } from '../../linting'
import { computeId } from './id'
import { asCode, IssueLinter } from './typings'

const code = asCode('C_001')

export const C_001: IssueDefinition<typeof code> = {
  code,
  severity: 'critical',
  name: 'slot_has_nonexistent_entity'
}

const makeSlotChecker = (listEntities: ListEntityDefinition[], patternEntities: PatternEntityDefinition[]) => (
  intent: IntentDefinition,
  slot: SlotDefinition
): DatasetIssue<typeof code>[] => {
  const { entities } = slot

  const supportedTypes = [
    ...listEntities.map((e) => e.name),
    ...patternEntities.map((p) => p.name),
    ...SYSTEM_ENTITIES,
    SLOT_ANY
  ]

  const issues: DatasetIssue<typeof code>[] = []

  for (const entity of entities) {
    if (!supportedTypes.includes(entity)) {
      const data = {
        entity,
        intent: intent.name,
        slot: slot.name
      }

      issues.push({
        ...C_001,
        id: computeId(code, data),
        message: `Slot "${slot.name}" of intent "${intent.name}" referers to a type that does not exist: "${entity}"`,
        data
      })
    }
  }

  return issues
}

const validateIntent = (
  intent: IntentDefinition,
  lists: ListEntityDefinition[],
  patterns: PatternEntityDefinition[]
): DatasetIssue<typeof code>[] => {
  const checkSlot = makeSlotChecker(lists, patterns)
  return _.flatMap(intent.slots, (s) => checkSlot(intent, s))
}

export const C_001_Linter: IssueLinter<typeof code> = {
  ...C_001,
  speed: 'fastest',
  lint: async (ts: TrainInput) => {
    const { entities } = ts
    const lists = entities.filter(isListEntity)
    const patterns = entities.filter(isPatternEntity)

    let issues: DatasetIssue<typeof code>[] = []

    for (const i of ts.intents) {
      issues = [...issues, ...validateIntent(i, lists, patterns)]
    }
    return issues
  }
}
