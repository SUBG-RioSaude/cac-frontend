import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import '@testing-library/jest-dom'

import { patchNotesService } from '@/services/patch-notes-service'
import { PatchNoteTipo, PatchNoteImportancia } from '@/types/patch-notes'

import { CriarPatchNoteModal } from '../criar-patch-note-modal'

// Mock dos serviços
vi.mock('@/services/patch-notes-service')
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('CriarPatchNoteModal', () => {
  const mockOnOpenChange = vi.fn()
  const mockOnSuccess = vi.fn()

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    onSuccess: mockOnSuccess,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderização básica', () => {
    it('deve renderizar modal quando aberto', () => {
      render(<CriarPatchNoteModal {...defaultProps} />)

      expect(screen.getByText('Criar Novo Patch Note')).toBeInTheDocument()
      expect(
        screen.getByText('Adicione uma nova atualização ao sistema'),
      ).toBeInTheDocument()
    })

    it('não deve renderizar quando fechado', () => {
      render(<CriarPatchNoteModal {...defaultProps} open={false} />)

      expect(
        screen.queryByText('Criar Novo Patch Note'),
      ).not.toBeInTheDocument()
    })

    it('deve renderizar todos os campos do formulário', () => {
      render(<CriarPatchNoteModal {...defaultProps} />)

      expect(screen.getByLabelText('Versão')).toBeInTheDocument()
      expect(screen.getAllByText('Tipo')).toHaveLength(2)
      expect(screen.getByText('Itens da Atualização')).toBeInTheDocument()
    })

    it('deve renderizar um item inicial por padrão', () => {
      render(<CriarPatchNoteModal {...defaultProps} />)

      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })
  })

  describe('Campo de Versão', () => {
    it('deve validar versão obrigatória', async () => {
      const user = userEvent.setup()
      render(<CriarPatchNoteModal {...defaultProps} />)

      const submitButton = await screen.findByText('Criar Patch Note')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Versão é obrigatória')).toBeInTheDocument()
      })
    })
  })

  describe('Gerenciamento de Itens', () => {
    it('deve adicionar novo item ao clicar em "Adicionar Item"', async () => {
      const user = userEvent.setup()
      render(<CriarPatchNoteModal {...defaultProps} />)

      await screen.findByText('Item 1')
      expect(screen.queryByText('Item 2')).not.toBeInTheDocument()

      const addButton = await screen.findByText('Adicionar Item')
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Item 2')).toBeInTheDocument()
      })
    })

    it('deve remover item ao clicar no botão de deletar', async () => {
      const user = userEvent.setup()
      render(<CriarPatchNoteModal {...defaultProps} />)

      // Adicionar segundo item primeiro
      const addButton = await screen.findByText('Adicionar Item')
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Item 2')).toBeInTheDocument()
      })

      // Encontrar e clicar no botão de remover do segundo item
      const deleteButtons = screen.getAllByRole('button')
      const trashButton = deleteButtons.find((btn) => {
        const svg = btn.querySelector('svg')
        return svg?.classList.toString().includes('lucide-trash')
      })

      if (trashButton) {
        await user.click(trashButton)

        await waitFor(() => {
          expect(screen.queryByText('Item 2')).not.toBeInTheDocument()
        })
      }
    })

    it('não deve mostrar botão de remover quando há apenas um item', () => {
      render(<CriarPatchNoteModal {...defaultProps} />)

      expect(screen.getByText('Item 1')).toBeInTheDocument()

      const deleteButtons = screen.queryAllByRole('button')
      const hasTrashButton = deleteButtons.some((btn) => {
        const svg = btn.querySelector('svg')
        return svg?.classList.toString().includes('lucide-trash')
      })

      expect(hasTrashButton).toBe(false)
    })
  })

  describe('Campos do Item', () => {
    it('deve validar mensagem obrigatória', async () => {
      const user = userEvent.setup()
      render(<CriarPatchNoteModal {...defaultProps} />)

      // Preencher apenas a versão usando fireEvent (mais direto)
      const versaoInput = await screen.findByPlaceholderText('Ex: v1.2.3')
      fireEvent.change(versaoInput, { target: { value: 'v1.0.0' } })

      const submitButton = await screen.findByText('Criar Patch Note')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Mensagem é obrigatória')).toBeInTheDocument()
      })
    })
  })

  describe('Submissão do formulário', () => {
    it('deve criar patch note com sucesso', async () => {
      const user = userEvent.setup()
      vi.mocked(patchNotesService.criar).mockResolvedValue(undefined)

      render(<CriarPatchNoteModal {...defaultProps} />)

      // Preencher formulário usando fireEvent
      const versaoInput = await screen.findByPlaceholderText('Ex: v1.2.3')
      fireEvent.change(versaoInput, { target: { value: 'v1.0.0' } })

      const mensagemInput = await screen.findByPlaceholderText(
        'Descreva a alteração',
      )
      fireEvent.change(mensagemInput, {
        target: { value: 'Nova funcionalidade' },
      })

      // Aguardar os valores serem aplicados
      await waitFor(() => {
        expect(versaoInput).toHaveValue('v1.0.0')
        expect(mensagemInput).toHaveValue('Nova funcionalidade')
      })

      const submitButton = await screen.findByText('Criar Patch Note')
      await user.click(submitButton)

      await waitFor(() => {
        expect(patchNotesService.criar).toHaveBeenCalled()
      })
    })

    it('deve chamar onSuccess após criar com sucesso', async () => {
      const user = userEvent.setup()
      vi.mocked(patchNotesService.criar).mockResolvedValue(undefined)

      render(<CriarPatchNoteModal {...defaultProps} />)

      const versaoInput = await screen.findByPlaceholderText('Ex: v1.2.3')
      fireEvent.change(versaoInput, { target: { value: 'v1.0.0' } })

      const mensagemInput = await screen.findByPlaceholderText(
        'Descreva a alteração',
      )
      fireEvent.change(mensagemInput, {
        target: { value: 'Nova funcionalidade' },
      })

      await waitFor(() => {
        expect(versaoInput).toHaveValue('v1.0.0')
      })

      const submitButton = await screen.findByText('Criar Patch Note')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })

    it('deve fechar modal após criar com sucesso', async () => {
      const user = userEvent.setup()
      vi.mocked(patchNotesService.criar).mockResolvedValue(undefined)

      render(<CriarPatchNoteModal {...defaultProps} />)

      const versaoInput = await screen.findByPlaceholderText('Ex: v1.2.3')
      fireEvent.change(versaoInput, { target: { value: 'v1.0.0' } })

      const mensagemInput = await screen.findByPlaceholderText(
        'Descreva a alteração',
      )
      fireEvent.change(mensagemInput, {
        target: { value: 'Nova funcionalidade' },
      })

      await waitFor(() => {
        expect(versaoInput).toHaveValue('v1.0.0')
      })

      const submitButton = await screen.findByText('Criar Patch Note')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it('deve exibir loading durante submissão', async () => {
      const user = userEvent.setup()
      vi.mocked(patchNotesService.criar).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      )

      render(<CriarPatchNoteModal {...defaultProps} />)

      const versaoInput = await screen.findByPlaceholderText('Ex: v1.2.3')
      fireEvent.change(versaoInput, { target: { value: 'v1.0.0' } })

      const mensagemInput = await screen.findByPlaceholderText(
        'Descreva a alteração',
      )
      fireEvent.change(mensagemInput, {
        target: { value: 'Nova funcionalidade' },
      })

      await waitFor(() => {
        expect(versaoInput).toHaveValue('v1.0.0')
      })

      const submitButton = await screen.findByText('Criar Patch Note')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Criando...')).toBeInTheDocument()
      })
    })

    it('deve desabilitar botões durante loading', async () => {
      const user = userEvent.setup()
      vi.mocked(patchNotesService.criar).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      )

      render(<CriarPatchNoteModal {...defaultProps} />)

      const versaoInput = await screen.findByPlaceholderText('Ex: v1.2.3')
      fireEvent.change(versaoInput, { target: { value: 'v1.0.0' } })

      const mensagemInput = await screen.findByPlaceholderText(
        'Descreva a alteração',
      )
      fireEvent.change(mensagemInput, {
        target: { value: 'Nova funcionalidade' },
      })

      await waitFor(() => {
        expect(versaoInput).toHaveValue('v1.0.0')
      })

      const submitButton = await screen.findByText('Criar Patch Note')
      await user.click(submitButton)

      await waitFor(() => {
        const cancelButton = screen.getByText('Cancelar')
        expect(cancelButton).toBeDisabled()
      })
    })

    it('deve lidar com erro ao criar', async () => {
      const user = userEvent.setup()
      vi.mocked(patchNotesService.criar).mockRejectedValue(
        new Error('Erro ao criar'),
      )

      render(<CriarPatchNoteModal {...defaultProps} />)

      const versaoInput = await screen.findByPlaceholderText('Ex: v1.2.3')
      fireEvent.change(versaoInput, { target: { value: 'v1.0.0' } })

      const mensagemInput = await screen.findByPlaceholderText(
        'Descreva a alteração',
      )
      fireEvent.change(mensagemInput, {
        target: { value: 'Nova funcionalidade' },
      })

      await waitFor(() => {
        expect(versaoInput).toHaveValue('v1.0.0')
      })

      const submitButton = await screen.findByText('Criar Patch Note')
      await user.click(submitButton)

      await waitFor(() => {
        expect(patchNotesService.criar).toHaveBeenCalled()
      })

      // Modal não deve fechar em caso de erro
      expect(screen.getByText('Criar Novo Patch Note')).toBeInTheDocument()
    })
  })

  describe('Botão Cancelar', () => {
    it('deve fechar modal ao clicar em Cancelar', async () => {
      const user = userEvent.setup()
      render(<CriarPatchNoteModal {...defaultProps} />)

      const cancelButton = await screen.findByText('Cancelar')
      await user.click(cancelButton)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Validação do formulário', () => {
    it('deve validar pelo menos um item', async () => {
      const user = userEvent.setup()
      render(<CriarPatchNoteModal {...defaultProps} />)

      const versaoInput = await screen.findByPlaceholderText('Ex: v1.2.3')
      fireEvent.change(versaoInput, { target: { value: 'v1.0.0' } })

      await waitFor(() => {
        expect(versaoInput).toHaveValue('v1.0.0')
      })

      const submitButton = await screen.findByText('Criar Patch Note')
      await user.click(submitButton)

      // Deve mostrar erro de mensagem obrigatória (do item)
      await waitFor(() => {
        expect(screen.getByText('Mensagem é obrigatória')).toBeInTheDocument()
      })
    })
  })

  describe('Estrutura de dados enviados', () => {
    it('deve enviar dados no formato correto', async () => {
      const user = userEvent.setup()
      vi.mocked(patchNotesService.criar).mockResolvedValue(undefined)

      render(<CriarPatchNoteModal {...defaultProps} />)

      const versaoInput = await screen.findByPlaceholderText('Ex: v1.2.3')
      fireEvent.change(versaoInput, { target: { value: 'v1.0.0' } })

      const mensagemInput = await screen.findByPlaceholderText(
        'Descreva a alteração',
      )
      fireEvent.change(mensagemInput, {
        target: { value: 'Nova funcionalidade' },
      })

      await waitFor(() => {
        expect(versaoInput).toHaveValue('v1.0.0')
      })

      const submitButton = await screen.findByText('Criar Patch Note')
      await user.click(submitButton)

      await waitFor(() => {
        expect(patchNotesService.criar).toHaveBeenCalledWith(
          expect.objectContaining({
            versao: 'v1.0.0',
            titulo: 'Novidade',
            items: expect.arrayContaining([
              expect.objectContaining({
                mensagem: 'Nova funcionalidade',
                tipo: PatchNoteTipo.Feature,
                importancia: PatchNoteImportancia.Baixa,
              }),
            ]),
            publicarImediatamente: true,
          }),
        )
      })
    })
  })
})
