import { GlobalAction } from '../../types/rx-actions';
import { rxDispatch } from '../../rx-stores/index';

// Rx global "dispatch" hook doesn't do a whole lot of anything
export default function useRxDispatch(): (action: GlobalAction) => void {
  return rxDispatch;
}
