type VariableType = 'COLOR' | 'NUMBER' | 'STRING' | 'BOOLEAN'

interface Variable {
  id: number
  name: string
  value: string
  collectionId: number
  collection?: Collection
}

interface Collection {
  id: number
  name: string
  type: VariableType
  variables: Variable[]
}

export type {
  Variable,
  Collection,
  VariableType
};
