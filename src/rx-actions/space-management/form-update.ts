import { SpaceManagementState } from "../../rx-stores/space-management";

export const SPACE_MANAGEMENT_FORM_UPDATE = 'SPACE_MANAGEMENT_FORM_UPDATE' as const;


type FormUpdateKey = keyof SpaceManagementState['formState']
type FormUpdateValue<K extends FormUpdateKey> = SpaceManagementState['formState'][K]

export default function spaceManagementFormUpdate(key: FormUpdateKey, value: FormUpdateValue<typeof key>) {
  return {
    type: SPACE_MANAGEMENT_FORM_UPDATE,
    key,
    value,
   };
}
