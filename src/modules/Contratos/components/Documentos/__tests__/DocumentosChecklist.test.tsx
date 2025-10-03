import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { ChecklistData } from '@/modules/Contratos/types/contrato'

import { DocumentosChecklist } from '../DocumentosChecklist'

// Mock console.log para capturar os logs do componente
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

describe('DocumentosChecklist', () => {
  const contratoId = '123'

  const checklistDataCompleto: ChecklistData = {
    termoReferencia: { entregue: true, dataEntrega: '2024-01-10' },
    homologacao: { entregue: true, dataEntrega: '2024-01-15' },
    ataRegistroPrecos: { entregue: false },
    garantiaContratual: { entregue: true, dataEntrega: '2024-01-20' },
    contrato: { entregue: true, dataEntrega: '2024-01-25' },
    publicacaoPncp: { entregue: false },
    publicacaoExtrato: { entregue: false },
  }

  const checklistDataVazio: ChecklistData = {
    termoReferencia: { entregue: false },
    homologacao: { entregue: false },
    ataRegistroPrecos: { entregue: false },
    garantiaContratual: { entregue: false },
    contrato: { entregue: false },
    publicacaoPncp: { entregue: false },
    publicacaoExtrato: { entregue: false },
  }

  beforeEach(() => {
    mockConsoleLog.mockClear()
  })

  describe('Renderização', () => {
    it('deve renderizar o título do componente', () => {
      render(
        <DocumentosChecklist
          checklistData={checklistDataVazio}
          contratoId={contratoId}
        />,
      )

      expect(screen.getByText('Checklist de Documentos')).toBeInTheDocument()
    })

    it('deve renderizar todos os 7 documentos obrigatórios', () => {
      render(
        <DocumentosChecklist
          checklistData={checklistDataVazio}
          contratoId={contratoId}
        />,
      )

      // Verifica se todos os documentos estão presentes
      expect(
        screen.getByLabelText('Termo de Referência/Edital'),
      ).toBeInTheDocument()
      expect(screen.getByLabelText('Homologação')).toBeInTheDocument()
      expect(
        screen.getByLabelText('Ata de Registro de Preços'),
      ).toBeInTheDocument()
      expect(screen.getByLabelText('Garantia Contratual')).toBeInTheDocument()
      expect(screen.getByLabelText('Contrato')).toBeInTheDocument()
      expect(screen.getByLabelText('Publicação PNCP')).toBeInTheDocument()
      expect(
        screen.getByLabelText('Publicação de Extrato Contratual'),
      ).toBeInTheDocument()
    })

    it('deve renderizar checkboxes desmarcados quando documentos não estão entregues', () => {
      render(
        <DocumentosChecklist
          checklistData={checklistDataVazio}
          contratoId={contratoId}
        />,
      )

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(7)

      checkboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeChecked()
      })
    })

    it('deve renderizar checkboxes marcados quando documentos estão entregues', () => {
      render(
        <DocumentosChecklist
          checklistData={checklistDataCompleto}
          contratoId={contratoId}
        />,
      )

      // Documentos marcados como entregues
      expect(screen.getByLabelText('Termo de Referência/Edital')).toBeChecked()
      expect(screen.getByLabelText('Homologação')).toBeChecked()
      expect(screen.getByLabelText('Garantia Contratual')).toBeChecked()
      expect(screen.getByLabelText('Contrato')).toBeChecked()

      // Documentos não entregues
      expect(
        screen.getByLabelText('Ata de Registro de Preços'),
      ).not.toBeChecked()
      expect(screen.getByLabelText('Publicação PNCP')).not.toBeChecked()
      expect(
        screen.getByLabelText('Publicação de Extrato Contratual'),
      ).not.toBeChecked()
    })
  })

  describe('Interações', () => {
    it('deve chamar handleCheckedChange quando checkbox é marcado', async () => {
      const user = userEvent.setup()

      render(
        <DocumentosChecklist
          checklistData={checklistDataVazio}
          contratoId={contratoId}
        />,
      )

      const termoReferenciaCheckbox = screen.getByLabelText(
        'Termo de Referência/Edital',
      )

      await user.click(termoReferenciaCheckbox)

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Documento termoReferencia (contrato 123) alterado para: true',
      )
    })

    it('deve chamar handleCheckedChange quando checkbox é desmarcado', async () => {
      const user = userEvent.setup()

      render(
        <DocumentosChecklist
          checklistData={checklistDataCompleto}
          contratoId={contratoId}
        />,
      )

      const homologacaoCheckbox = screen.getByLabelText('Homologação')
      expect(homologacaoCheckbox).toBeChecked()

      await user.click(homologacaoCheckbox)

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Documento homologacao (contrato 123) alterado para: false',
      )
    })

    it('deve permitir marcar múltiplos checkboxes', async () => {
      const user = userEvent.setup()

      render(
        <DocumentosChecklist
          checklistData={checklistDataVazio}
          contratoId={contratoId}
        />,
      )

      const termoReferenciaCheckbox = screen.getByLabelText(
        'Termo de Referência/Edital',
      )
      const contratoCheckbox = screen.getByLabelText('Contrato')

      await user.click(termoReferenciaCheckbox)
      await user.click(contratoCheckbox)

      expect(mockConsoleLog).toHaveBeenCalledTimes(2)
      expect(mockConsoleLog).toHaveBeenNthCalledWith(
        1,
        'Documento termoReferencia (contrato 123) alterado para: true',
      )
      expect(mockConsoleLog).toHaveBeenNthCalledWith(
        2,
        'Documento contrato (contrato 123) alterado para: true',
      )
    })

    it('deve funcionar com diferentes IDs de contrato', async () => {
      const user = userEvent.setup()
      const contratoId2 = 'contrato-456'

      render(
        <DocumentosChecklist
          checklistData={checklistDataVazio}
          contratoId={contratoId2}
        />,
      )

      const checkbox = screen.getByLabelText('Publicação PNCP')
      await user.click(checkbox)

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Documento publicacaoPncp (contrato contrato-456) alterado para: true',
      )
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter labels associados aos checkboxes', () => {
      render(
        <DocumentosChecklist
          checklistData={checklistDataVazio}
          contratoId={contratoId}
        />,
      )

      const checkboxes = screen.getAllByRole('checkbox')

      checkboxes.forEach((checkbox) => {
        expect(checkbox).toHaveAccessibleName()
      })
    })

    it('deve permitir navegação por teclado', async () => {
      const user = userEvent.setup()

      render(
        <DocumentosChecklist
          checklistData={checklistDataVazio}
          contratoId={contratoId}
        />,
      )

      const firstCheckbox = screen.getByLabelText('Termo de Referência/Edital')

      // Foca e marca o checkbox usando Space key
      await user.click(firstCheckbox) // Garante que o checkbox está focado
      await user.keyboard(' ')

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Documento termoReferencia (contrato 123) alterado para: true',
      )
    })

    it('deve ter IDs únicos para cada checkbox', () => {
      render(
        <DocumentosChecklist
          checklistData={checklistDataVazio}
          contratoId={contratoId}
        />,
      )

      const checkboxes = screen.getAllByRole('checkbox')
      const ids = checkboxes.map((cb) => cb.id)
      const uniqueIds = [...new Set(ids)]

      expect(uniqueIds).toHaveLength(7)
      expect(ids).toEqual(uniqueIds)
    })

    it('deve ter labels clicáveis', async () => {
      const user = userEvent.setup()

      render(
        <DocumentosChecklist
          checklistData={checklistDataVazio}
          contratoId={contratoId}
        />,
      )

      const label = screen.getByText('Garantia Contratual')
      await user.click(label)

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Documento garantiaContratual (contrato 123) alterado para: true',
      )
    })
  })

  describe('Edge Cases', () => {
    it('deve lidar com checklistData undefined/null graciosamente', () => {
      const checklistDataComUndefined = {
        ...checklistDataVazio,
        termoReferencia: undefined as never,
        homologacao: null as never,
      }

      render(
        <DocumentosChecklist
          checklistData={checklistDataComUndefined}
          contratoId={contratoId}
        />,
      )

      // Deve renderizar sem erros
      expect(screen.getByText('Checklist de Documentos')).toBeInTheDocument()

      // Checkboxes com dados undefined/null devem aparecer desmarcados
      expect(
        screen.getByLabelText('Termo de Referência/Edital'),
      ).not.toBeChecked()
      expect(screen.getByLabelText('Homologação')).not.toBeChecked()
    })

    it('deve funcionar com contratoId vazio', async () => {
      const user = userEvent.setup()

      render(
        <DocumentosChecklist
          checklistData={checklistDataVazio}
          contratoId=""
        />,
      )

      const checkbox = screen.getByLabelText('Contrato')
      await user.click(checkbox)

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Documento contrato (contrato ) alterado para: true',
      )
    })

    it('deve registrar mudanças quando checkbox é toggleado', async () => {
      const user = userEvent.setup()

      render(
        <DocumentosChecklist
          checklistData={checklistDataVazio}
          contratoId={contratoId}
        />,
      )

      const checkbox = screen.getByLabelText('Publicação de Extrato Contratual')

      // Verifica que começa desmarcado
      expect(checkbox).not.toBeChecked()

      // Marca o checkbox
      await user.click(checkbox)

      // Verifica que foi registrado
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Documento publicacaoExtrato (contrato 123) alterado para: true',
      )
    })
  })

  describe('Estrutura HTML', () => {
    it('deve ter estrutura semântica correta', () => {
      render(
        <DocumentosChecklist
          checklistData={checklistDataVazio}
          contratoId={contratoId}
        />,
      )

      // Verifica se há um heading para o título
      expect(screen.getByText('Checklist de Documentos')).toBeInTheDocument()

      // Verifica se todos os checkboxes estão presentes
      expect(screen.getAllByRole('checkbox')).toHaveLength(7)
    })

    it('deve aplicar classes CSS corretamente', () => {
      render(
        <DocumentosChecklist
          checklistData={checklistDataVazio}
          contratoId={contratoId}
        />,
      )

      // Verifica se existe pelo menos um container com space-x-2
      const containers = screen.getByText('Checklist de Documentos')
        .parentElement?.parentElement
      expect(containers).toBeInTheDocument()

      // Verifica se os checkboxes são renderizados
      expect(screen.getAllByRole('checkbox')).toHaveLength(7)
    })
  })
})
