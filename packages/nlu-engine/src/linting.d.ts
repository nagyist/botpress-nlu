export type DatasetReport = {
  issues: DatasetIssue<IssueCode>[]
}

export type IssueCode =
  | 'C_000' // tokens tagged with unexisting slot
  | 'C_001' // slot has nonexistent entity
  | 'C_002' // intent has no utterances
  | 'E_000' // token tagged with slot has incorrect type
  | 'E_002' // duplicated utterances (in one or more intents)
  | 'E_001' // utterance has incorrect language
  | 'E_003' // the whole utterance is tagged as a slot
  | 'W_000' // intents are overlapping

export type IssueData<C extends IssueCode> = C extends 'C_000'
  ? {
      intent: string
      utterance: string
      slot: string
    }
  : C extends 'C_001'
  ? {
      intent: string
      slot: string
      entity: string
    }
  : C extends 'C_002'
  ? {
      intent: string
    }
  : C extends 'E_000'
  ? {
      intent: string
      utterance: string
      slot: string
      entities: string[]
      source: string
    }
  : C extends 'E_001'
  ? {
      intent: string
      utterance: string
      detectedLang: string
      expectedLang: string
    }
  : C extends 'E_002'
  ? {
      intentA: string
      intentB: string
      utterance: string
    }
  : C extends 'E_003'
  ? {
      intent: string
      utterance: string
      slot: string
    }
  : never

export type IssueDefinition<C extends IssueCode> = {
  code: C
  severity: IssueSeverity<C>
  name: string
}

export type DatasetIssue<C extends IssueCode> = IssueDefinition<C> & {
  id: string
  message: string
  data: IssueData<C>
}

export type LintingStatus = 'done' | 'linting-pending' | 'linting' | 'canceled' | 'errored'
export type LintingErrorType = 'lang-server' | 'duckling-server' | 'zombie-linting' | 'internal'

export type LintingError = {
  type: TrainingErrorType
  message: string
  stack?: string
}

export type LintingState = {
  status: LintingStatus
  currentCount: number
  totalCount: number
  error?: LintingError
  issues: DatasetIssue<IssueCode>[]
}

export type IssueSeverity<C extends IssueCode> = C extends `C_${infer CodeSufix}`
  ? 'critical'
  : C extends `E_${infer CodeSufix}`
  ? 'error'
  : C extends `W_${infer CodeSufix}`
  ? 'warning'
  : C extends `I_${infer CodeSufix}`
  ? 'info'
  : never
