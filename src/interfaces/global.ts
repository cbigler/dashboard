import { StateType, ActionType } from 'typesafe-actions';

export type State = StateType<ReturnType<typeof import('../store').reducer>>;
