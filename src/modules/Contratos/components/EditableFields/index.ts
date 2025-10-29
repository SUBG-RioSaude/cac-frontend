export { EditableTextField } from './editable-text-field'
export { EditableCurrencyField } from './editable-currency-field'
export { EditableDateField } from './editable-date-field'
export { EditableFieldWrapper } from './editable-field-wrapper'
export { ConfirmEditModal } from './confirm-edit-modal'
export { useFieldEditing } from '../../hooks/use-field-editing'
export type {
  EditableFieldType,
  EditableFieldConfig,
} from '../../config/editable-fields-config'
export {
  EDITABLE_FIELDS_CONFIG,
  requiresConfirmation,
  isCriticalField,
  getFieldConfig,
  getFieldLabel,
} from '../../config/editable-fields-config'
