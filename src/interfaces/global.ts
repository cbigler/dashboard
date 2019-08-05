import { StateType, ActionType } from 'typesafe-actions';

export type AppState = StateType<ReturnType<typeof import('../store').reducer>>;
