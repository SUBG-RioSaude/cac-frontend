export type EditableFieldType = 'text' | 'currency' | 'date' | 'select' | 'textarea'

export interface EditableFieldConfig {
  fieldKey: string
  label: string
  type: EditableFieldType
  requiresConfirmation: boolean
  isCritical: boolean
  validation?: {
    required?: boolean
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: RegExp
  }
  options?: Array<{ value: string; label: string }> // Para campos select
}

/**
 * Configuração de campos editáveis do contrato
 * Define quais campos podem ser editados e suas características
 */
export const EDITABLE_FIELDS_CONFIG: Record<string, EditableFieldConfig> = {
  // Campos básicos - sem confirmação
  processoSei: {
    fieldKey: 'processoSei',
    label: 'Processo SEI',
    type: 'text',
    requiresConfirmation: false,
    isCritical: false,
    validation: {
      maxLength: 50
    }
  },
  
  processoRio: {
    fieldKey: 'processoRio',
    label: 'Processo Rio',
    type: 'text',
    requiresConfirmation: false,
    isCritical: false,
    validation: {
      maxLength: 50
    }
  },
  
  descricaoObjeto: {
    fieldKey: 'descricaoObjeto',
    label: 'Descrição do Objeto',
    type: 'textarea',
    requiresConfirmation: false,
    isCritical: false,
    validation: {
      required: true,
      maxLength: 500
    }
  },
  
  termoReferencia: {
    fieldKey: 'termoReferencia',
    label: 'Termo de Referência',
    type: 'text',
    requiresConfirmation: false,
    isCritical: false,
    validation: {
      maxLength: 100
    }
  },
  
  formaPagamento: {
    fieldKey: 'formaPagamento',
    label: 'Forma de Pagamento',
    type: 'text',
    requiresConfirmation: false,
    isCritical: false,
    validation: {
      maxLength: 100
    }
  },

  // Campos críticos - com confirmação obrigatória
  numeroContrato: {
    fieldKey: 'numeroContrato',
    label: 'Número do Contrato',
    type: 'text',
    requiresConfirmation: true,
    isCritical: true,
    validation: {
      required: true,
      maxLength: 50
    }
  },
  
  valorGlobal: {
    fieldKey: 'valorGlobal',
    label: 'Valor Global',
    type: 'currency',
    requiresConfirmation: true,
    isCritical: true,
    validation: {
      required: true,
      min: 0.01
    }
  },
  
  vigenciaInicial: {
    fieldKey: 'vigenciaInicial',
    label: 'Data de Início da Vigência',
    type: 'date',
    requiresConfirmation: true,
    isCritical: true,
    validation: {
      required: true
    }
  },
  
  vigenciaFinal: {
    fieldKey: 'vigenciaFinal',
    label: 'Data Final da Vigência',
    type: 'date',
    requiresConfirmation: true,
    isCritical: true,
    validation: {
      required: true
    }
  },
  
  tipoContrato: {
    fieldKey: 'tipoContrato',
    label: 'Tipo de Contrato',
    type: 'select',
    requiresConfirmation: true,
    isCritical: true,
    options: [
      { value: 'servicos', label: 'Serviços' },
      { value: 'obras', label: 'Obras' },
      { value: 'fornecimento', label: 'Fornecimento' },
      { value: 'concessao', label: 'Concessão' }
    ]
  },
  
  tipoContratacao: {
    fieldKey: 'tipoContratacao',
    label: 'Tipo de Contratação',
    type: 'select',
    requiresConfirmation: false,
    isCritical: false,
    options: [
      { value: 'centralizado', label: 'Centralizado' },
      { value: 'descentralizado', label: 'Descentralizado' }
    ]
  },

  categoriaObjeto: {
    fieldKey: 'categoriaObjeto',
    label: 'Categoria do Objeto',
    type: 'text',
    requiresConfirmation: false,
    isCritical: false,
    validation: {
      maxLength: 100
    }
  }
}

/**
 * Verifica se um campo requer confirmação
 */
export function requiresConfirmation(fieldKey: string): boolean {
  return EDITABLE_FIELDS_CONFIG[fieldKey]?.requiresConfirmation ?? false
}

/**
 * Verifica se um campo é crítico
 */
export function isCriticalField(fieldKey: string): boolean {
  return EDITABLE_FIELDS_CONFIG[fieldKey]?.isCritical ?? false
}

/**
 * Obtém a configuração de um campo
 */
export function getFieldConfig(fieldKey: string): EditableFieldConfig | undefined {
  return EDITABLE_FIELDS_CONFIG[fieldKey]
}

/**
 * Obtém o label de um campo
 */
export function getFieldLabel(fieldKey: string): string {
  return EDITABLE_FIELDS_CONFIG[fieldKey]?.label ?? fieldKey
}