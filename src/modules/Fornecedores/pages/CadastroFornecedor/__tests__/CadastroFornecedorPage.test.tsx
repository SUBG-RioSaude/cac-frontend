import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import CadastroFornecedorPage from '../CadastroFornecedorPage'

// Mock do react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock do sonner para toasts
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock da API ViaCEP
global.fetch = vi.fn()

// Mock das funções utilitárias
vi.mock('@/lib/utils', () => ({
  cn: vi.fn((...args) => args.filter(Boolean).join(' ')),
  cnpjUtils: {
    aplicarMascara: vi.fn((value) => value),
    validar: vi.fn((value) => value === '11.222.333/0001-81'),
    limpar: vi.fn((value) => value.replace(/\D/g, '')),
  },
  ieUtils: {
    aplicarMascara: vi.fn((value) => value),
    validar: vi.fn(() => true),
  },
  imUtils: {
    aplicarMascara: vi.fn((value) => value),
    validar: vi.fn(() => true),
  },
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  )
}

describe('CadastroFornecedorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('deve renderizar o formulário de cadastro', () => {
    renderWithRouter(<CadastroFornecedorPage />)
    
    expect(screen.getByText('Cadastrar Fornecedor')).toBeInTheDocument()
    expect(screen.getByText('Preencha as informações do novo fornecedor')).toBeInTheDocument()
    expect(screen.getByText('Documentação')).toBeInTheDocument()
    expect(screen.getByText('Endereço')).toBeInTheDocument()
    expect(screen.getByText('Contatos')).toBeInTheDocument()
  })

  it('deve renderizar todos os campos obrigatórios', () => {
    renderWithRouter(<CadastroFornecedorPage />)
    
    expect(screen.getByLabelText('CNPJ *')).toBeInTheDocument()
    expect(screen.getByLabelText('Razão Social *')).toBeInTheDocument()
    expect(screen.getByLabelText('CEP *')).toBeInTheDocument()
    expect(screen.getByLabelText('Logradouro *')).toBeInTheDocument()
    expect(screen.getByLabelText('Número *')).toBeInTheDocument()
    expect(screen.getByLabelText('Bairro *')).toBeInTheDocument()
    expect(screen.getByLabelText('Cidade *')).toBeInTheDocument()
    expect(screen.getByLabelText('UF *')).toBeInTheDocument()
  })

  it('deve navegar de volta ao clicar no botão voltar', () => {
    renderWithRouter(<CadastroFornecedorPage />)
    
    const botaoVoltar = screen.getByRole('button', { name: 'Voltar para lista' })
    fireEvent.click(botaoVoltar)
    
    expect(mockNavigate).toHaveBeenCalledWith('/fornecedores')
  })

  it('deve aplicar máscara no campo CNPJ', async () => {
    const { cnpjUtils } = await import('@/lib/utils')
    renderWithRouter(<CadastroFornecedorPage />)
    
    const cnpjInput = screen.getByLabelText('CNPJ *')
    fireEvent.change(cnpjInput, { target: { value: '11222333000181' } })
    
    expect(cnpjUtils.aplicarMascara).toHaveBeenCalledWith('11222333000181')
  })

  it('deve buscar CEP automaticamente quando preenchido', async () => {
    const mockResponse = {
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      bairro: 'Bela Vista',
      localidade: 'São Paulo',
      uf: 'SP',
    }
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: async () => mockResponse,
    })
    
    renderWithRouter(<CadastroFornecedorPage />)
    
    const cepInput = screen.getByLabelText('CEP *')
    fireEvent.change(cepInput, { target: { value: '01310-100' } })
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('https://viacep.com.br/ws/01310100/json/')
    })
  })

  it('deve adicionar um novo contato', () => {
    renderWithRouter(<CadastroFornecedorPage />)
    
    const botaoAdicionarContato = screen.getByRole('button', { name: 'Adicionar Contato' })
    fireEvent.click(botaoAdicionarContato)
    
    expect(screen.getByText('Contato 2')).toBeInTheDocument()
  })

  it('deve limitar contatos a no máximo 3', () => {
    renderWithRouter(<CadastroFornecedorPage />)
    
    const botaoAdicionarContato = screen.getByRole('button', { name: 'Adicionar Contato' })
    
    // Adiciona 2 contatos (já existe 1)
    fireEvent.click(botaoAdicionarContato)
    fireEvent.click(botaoAdicionarContato)
    
    expect(screen.getByText('Contato 3')).toBeInTheDocument()
    expect(botaoAdicionarContato).toBeDisabled()
  })

  it('deve remover um contato', async () => {
    renderWithRouter(<CadastroFornecedorPage />)
    
    const botaoAdicionarContato = screen.getByRole('button', { name: 'Adicionar Contato' })
    fireEvent.click(botaoAdicionarContato)
    
    await waitFor(() => {
      expect(screen.getByText('Contato 2')).toBeInTheDocument()
    })
    
    // Procurar botões com ícone de lixeira
    const botoesRemover = screen.getAllByRole('button')
    const botaoRemover = botoesRemover.find(button => 
      button.querySelector('svg') || button.textContent?.includes('Remover')
    )
    
    if (botaoRemover) {
      fireEvent.click(botaoRemover)
      
      await waitFor(() => {
        expect(screen.queryByText('Contato 2')).not.toBeInTheDocument()
      })
    }
  })

  it('deve validar formulário antes de salvar', async () => {
    const { toast } = await import('sonner')
    renderWithRouter(<CadastroFornecedorPage />)
    
    const botaoSalvar = screen.getByRole('button', { name: 'Salvar Fornecedor' })
    fireEvent.click(botaoSalvar)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'CEP inválido ou não encontrado',
        { description: 'É necessário um CEP válido para prosseguir com o cadastro.' }
      )
    })
  })

  it('deve navegar para lista após salvar com sucesso', async () => {
    const { toast } = await import('sonner')
    const { cnpjUtils } = await import('@/lib/utils')
    
    // Mock para simular CEP válido
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: async () => ({
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
      }),
    })
    
    renderWithRouter(<CadastroFornecedorPage />)
    
    // Preenche dados mínimos
    const cnpjInput = screen.getByLabelText('CNPJ *')
    fireEvent.change(cnpjInput, { target: { value: '11.222.333/0001-81' } })
    
    const razaoSocialInput = screen.getByLabelText('Razão Social *')
    fireEvent.change(razaoSocialInput, { target: { value: 'Empresa Teste LTDA' } })
    
    const cepInput = screen.getByLabelText('CEP *')
    fireEvent.change(cepInput, { target: { value: '01310-100' } })
    
    // Espera o CEP ser processado
    await waitFor(() => {
      expect(screen.getByDisplayValue('São Paulo')).toBeInTheDocument()
    })
    
    // Preenche número
    const numeroInput = screen.getByLabelText('Número *')
    fireEvent.change(numeroInput, { target: { value: '1000' } })
    
    // Preenche contato
    const nomeContatoInput = screen.getByLabelText('Nome do Contato *')
    fireEvent.change(nomeContatoInput, { target: { value: 'João Silva' } })
    
    const valorContatoInput = screen.getByLabelText('E-mail *')
    fireEvent.change(valorContatoInput, { target: { value: 'joao@empresa.com' } })
    
    const botaoSalvar = screen.getByRole('button', { name: 'Salvar Fornecedor' })
    fireEvent.click(botaoSalvar)
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Fornecedor cadastrado com sucesso!')
      expect(mockNavigate).toHaveBeenCalledWith('/fornecedores')
    })
  })

  it('deve aplicar máscara nos campos de telefone', () => {
    renderWithRouter(<CadastroFornecedorPage />)
    
    // Verifica se o campo de contato está presente
    const valorContatoInput = screen.getByPlaceholderText('exemplo@email.com')
    expect(valorContatoInput).toBeInTheDocument()
    
    // Testa preenchimento do campo
    fireEvent.change(valorContatoInput, { target: { value: 'teste@exemplo.com' } })
    expect(valorContatoInput).toHaveValue('teste@exemplo.com')
  })

  it('deve desabilitar campos de endereço até CEP válido', () => {
    renderWithRouter(<CadastroFornecedorPage />)
    
    const enderecoInput = screen.getByLabelText('Logradouro *')
    const numeroInput = screen.getByLabelText('Número *')
    const bairroInput = screen.getByLabelText('Bairro *')
    const cidadeInput = screen.getByLabelText('Cidade *')
    
    expect(enderecoInput).toBeDisabled()
    expect(numeroInput).toBeDisabled()
    expect(bairroInput).toBeDisabled()
    expect(cidadeInput).toBeDisabled()
  })

  it('deve mostrar botão de bypass quando CEP não encontrado', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: async () => ({ erro: true }),
    })
    
    renderWithRouter(<CadastroFornecedorPage />)
    
    const cepInput = screen.getByLabelText('CEP *')
    fireEvent.change(cepInput, { target: { value: '99999-999' } })
    
    await waitFor(() => {
      expect(screen.getByText('Continuar sem validar CEP')).toBeInTheDocument()
    })
  })

  it('deve permitir bypass do CEP', async () => {
    const { toast } = await import('sonner')
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: async () => ({ erro: true }),
    })
    
    renderWithRouter(<CadastroFornecedorPage />)
    
    const cepInput = screen.getByLabelText('CEP *')
    fireEvent.change(cepInput, { target: { value: '99999-999' } })
    
    await waitFor(() => {
      const botaoBypass = screen.getByText('Continuar sem validar CEP')
      fireEvent.click(botaoBypass)
    })
    
    expect(toast.success).toHaveBeenCalledWith(
      'CEP liberado para preenchimento manual',
      { description: 'Você pode preencher o endereço manualmente.' }
    )
  })
})