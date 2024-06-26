import { TrainInput } from '@botpress/nlu-client'

export const sample = {
  utterance: 'these grapes look moldy!',
  intent: 'fruit-is-moldy'
}

export const trainSet: TrainInput = {
  language: 'en',
  intents: [
    {
      name: 'fruit-is-moldy',
      contexts: ['grocery'],
      utterances: [
        'fruit is moldy',
        'this fruit is moldy',
        'this [banana](moldy_fruit) is not good to eat',
        'theses [oranges](moldy_fruit) have passed',
        'theses [grapes](moldy_fruit) look bad',
        'theses [apples](moldy_fruit) look so moldy'
      ],
      slots: [
        {
          name: 'moldy_fruit',
          entities: ['fruits']
        }
      ]
    },
    {
      name: 'hello',
      contexts: ['global', 'grocery'],
      slots: [],
      utterances: [
        'good day!',
        'good morning',
        'holla',
        'bonjour',
        'hey there',
        'hi bot',
        'hey bot',
        'hey robot',
        'hey!',
        'hi',
        'hello'
      ]
    },
    {
      name: 'talk-to-manager',
      contexts: ['grocery'],
      utterances: [
        'talk to manager',
        'I want to talk to the manager',
        "Who's your boss?",
        'Can I talk to the person in charge?',
        "I'd like to speak to your manager",
        'Can I talk to your boss? plz',
        'I wanna speak to manager please',
        'let me speak to your boss or someone',
        'can I meet your boss [at 1pm today](appointment_time) ?',
        'will your manager be available [tomorrow afternoon around 4pm](appointment_time)'
      ],
      slots: [
        {
          name: 'appointment_time',
          entities: ['time']
        }
      ]
    },
    {
      name: 'where-is',
      contexts: ['grocery'],
      utterances: [
        'where is [milk](thing_to_search) ?',
        'where are [apples](thing_to_search) ?',
        'can you help me find [apples](thing_to_search) ?',
        "I'm searching for [pie](thing_to_search) ?",
        'where is the [milk](thing_to_search) ?',
        'where are the [milk](thing_to_search) ?'
      ],
      slots: [
        {
          name: 'thing_to_search',
          entities: ['fruits', 'any']
        }
      ]
    }
  ],
  entities: [
    {
      name: 'fruits',
      type: 'list',
      fuzzy: 0.9,
      values: [
        { name: 'banana', synonyms: ['bananas'] },
        { name: 'apple', synonyms: ['apples'] },
        { name: 'grape', synonyms: ['grapes'] },
        { name: 'orange', synonyms: ['oranges'] }
      ]
    }
  ],
  seed: 42
}
