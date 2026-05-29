export const EntitiesIPC = {
  GET_GROUP: 'entities:get-group',
  GET_ENTITIES: 'entities:get-entities',
  GET_SETUP_STATE: 'entities:get-setup-state',
  COMPLETE_SETUP: 'entities:complete-setup',
  UPDATE_GROUP_NAME: 'entities:update-group-name',
  CREATE_ENTITY: 'entities:create-entity',
  RENAME_ENTITY: 'entities:rename-entity',
  UPDATE_ENTITY_VAT: 'entities:update-entity-vat',
} as const;

export type EntitiesIPC = (typeof EntitiesIPC)[keyof typeof EntitiesIPC];
