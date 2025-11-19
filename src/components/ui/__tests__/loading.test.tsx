import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import {
  LoadingSpinner,
  LoadingFallback,
  FormLoadingFallback,
  ButtonLoadingSpinner,
} from '../loading'

describe('Loading Components', () => {
  describe('LoadingSpinner', () => {
    it('deve renderizar com tamanho padrão (md)', () => {
      const { container } = render(<LoadingSpinner />)

      const spinner = container.firstChild as HTMLElement
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('h-8', 'w-8', 'animate-spin', 'rounded-full')
    })

    it('deve renderizar com tamanho small', () => {
      const { container } = render(<LoadingSpinner size="sm" />)

      const spinner = container.firstChild as HTMLElement
      expect(spinner).toHaveClass('h-4', 'w-4')
    })

    it('deve renderizar com tamanho large', () => {
      const { container } = render(<LoadingSpinner size="lg" />)

      const spinner = container.firstChild as HTMLElement
      expect(spinner).toHaveClass('h-12', 'w-12')
    })

    it('deve aplicar className customizada', () => {
      const customClass = 'border-red-500'
      const { container } = render(<LoadingSpinner className={customClass} />)

      const spinner = container.firstChild as HTMLElement
      expect(spinner).toHaveClass(customClass)
    })

    it('deve ter estilos de animação corretos', () => {
      const { container } = render(<LoadingSpinner />)

      const spinner = container.firstChild as HTMLElement
      expect(spinner).toHaveClass(
        'animate-spin',
        'rounded-full',
        'border-2',
        'border-gray-300',
        'border-t-blue-600',
      )
    })

    it('deve manter classes de tamanho corretas para todos os sizes', () => {
      const sizes = ['sm', 'md', 'lg'] as const
      const expectedClasses = ['h-4 w-4', 'h-8 w-8', 'h-12 w-12']

      sizes.forEach((size, index) => {
        const { container } = render(<LoadingSpinner size={size} />)
        const spinner = container.firstChild as HTMLElement

        const [heightClass, widthClass] = expectedClasses[index].split(' ')
        expect(spinner).toHaveClass(heightClass, widthClass)
      })
    })
  })

  describe('LoadingFallback', () => {
    it('deve renderizar com mensagem padrão', () => {
      render(<LoadingFallback />)

      expect(screen.getByText('Carregando...')).toBeInTheDocument()
    })

    it('deve renderizar com mensagem customizada', () => {
      const customMessage = 'Aguarde um momento...'
      render(<LoadingFallback message={customMessage} />)

      expect(screen.getByText(customMessage)).toBeInTheDocument()
    })

    it('deve mostrar spinner por padrão', () => {
      const { container } = render(<LoadingFallback />)

      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('deve ocultar spinner quando showSpinner=false', () => {
      const { container } = render(<LoadingFallback showSpinner={false} />)

      const spinner = container.querySelector('.animate-spin')
      expect(spinner).not.toBeInTheDocument()
    })

    it('deve ter layout centralizado correto', () => {
      const { container } = render(<LoadingFallback />)

      const mainContainer = container.firstChild as HTMLElement
      expect(mainContainer).toHaveClass(
        'flex',
        'items-center',
        'justify-center',
        'p-8',
      )

      const innerContainer = mainContainer.firstChild as HTMLElement
      expect(innerContainer).toHaveClass('flex', 'items-center', 'gap-3')
    })

    it('deve aplicar estilos corretos na mensagem', () => {
      render(<LoadingFallback message="Teste" />)

      const message = screen.getByText('Teste')
      expect(message).toHaveClass('text-gray-600')
    })

    it('deve renderizar spinner e mensagem lado a lado', () => {
      const { container } = render(
        <LoadingFallback message="Carregando dados..." />,
      )

      const innerContainer = container.querySelector('.flex.items-center.gap-3')
      expect(innerContainer?.children).toHaveLength(2)

      // Spinner deve ser o primeiro elemento
      const spinner = innerContainer?.children[0]
      expect(spinner).toHaveClass('animate-spin')

      // Mensagem deve ser o segundo elemento
      const message = innerContainer?.children[1]
      expect(message).toHaveTextContent('Carregando dados...')
    })
  })

  describe('FormLoadingFallback', () => {
    it('deve renderizar skeleton de formulário', () => {
      const { container } = render(<FormLoadingFallback />)

      const formSkeleton = container.firstChild as HTMLElement
      expect(formSkeleton).toBeInTheDocument()
      expect(formSkeleton).toHaveClass('animate-pulse', 'space-y-6')
    })

    it('deve ter estrutura correta de campos', () => {
      const { container } = render(<FormLoadingFallback />)

      // Deve ter 3 campos + 1 botão
      const fieldGroups = container.querySelectorAll('.space-y-3')
      expect(fieldGroups).toHaveLength(3)
    })

    it('deve ter skeletons de labels com tamanhos variados', () => {
      const { container } = render(<FormLoadingFallback />)

      const labels = container.querySelectorAll('.h-4')
      expect(labels).toHaveLength(3)

      // Verificar tamanhos diferentes dos labels
      expect(labels[0]).toHaveClass('w-24')
      expect(labels[1]).toHaveClass('w-32')
      expect(labels[2]).toHaveClass('w-28')
    })

    it('deve ter skeletons de inputs uniformes', () => {
      const { container } = render(<FormLoadingFallback />)

      const inputs = container.querySelectorAll('.h-10.rounded.bg-gray-200')
      expect(inputs).toHaveLength(4) // 3 campos + 1 botão
    })

    it('deve ter botão alinhado à direita', () => {
      const { container } = render(<FormLoadingFallback />)

      const buttonContainer = container.querySelector('.flex.justify-end')
      expect(buttonContainer).toBeInTheDocument()

      const buttonSkeleton = buttonContainer?.querySelector('.h-10.w-24')
      expect(buttonSkeleton).toBeInTheDocument()
    })

    it('deve ter estilos de skeleton corretos', () => {
      const { container } = render(<FormLoadingFallback />)

      const allSkeletons = container.querySelectorAll('.bg-gray-200')
      expect(allSkeletons.length).toBeGreaterThan(0)

      // Todos os skeletons devem ter border radius
      allSkeletons.forEach((skeleton) => {
        expect(skeleton).toHaveClass('rounded')
      })
    })
  })

  describe('ButtonLoadingSpinner', () => {
    it('deve renderizar spinner pequeno', () => {
      const { container } = render(<ButtonLoadingSpinner />)

      const spinner = container.firstChild as HTMLElement
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('h-4', 'w-4') // size="sm"
    })

    it('deve ter cores específicas para botão', () => {
      const { container } = render(<ButtonLoadingSpinner />)

      const spinner = container.firstChild as HTMLElement
      expect(spinner).toHaveClass('border-white', 'border-t-transparent')
    })

    it('deve aplicar className customizada', () => {
      const customClass = 'border-green-500'
      const { container } = render(
        <ButtonLoadingSpinner className={customClass} />,
      )

      const spinner = container.firstChild as HTMLElement
      expect(spinner).toHaveClass(customClass)
    })

    it('deve manter animação de spinning', () => {
      const { container } = render(<ButtonLoadingSpinner />)

      const spinner = container.firstChild as HTMLElement
      expect(spinner).toHaveClass('animate-spin', 'rounded-full')
    })

    it('deve ser baseado no LoadingSpinner', () => {
      const { container } = render(<ButtonLoadingSpinner />)

      const spinner = container.firstChild as HTMLElement

      // Deve ter classes do LoadingSpinner base
      expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'border-2')

      // Mas com override de cores específicas
      expect(spinner).toHaveClass('border-white', 'border-t-transparent')
    })
  })

  describe('Integração e Acessibilidade', () => {
    it('LoadingFallback deve ser acessível', () => {
      render(<LoadingFallback message="Carregando dados do sistema" />)

      const message = screen.getByText('Carregando dados do sistema')
      expect(message).toBeInTheDocument()

      // A mensagem deve ser legível por screen readers
      expect(message.tagName).toBe('SPAN')
    })

    it('Spinners devem ter indicação visual de carregamento', () => {
      const { container } = render(<LoadingSpinner />)

      const spinner = container.firstChild as HTMLElement

      // Deve ter contraste visual adequado
      expect(spinner).toHaveClass('border-gray-300', 'border-t-blue-600')

      // Deve ter animação contínua
      expect(spinner).toHaveClass('animate-spin')
    })

    it('FormLoadingFallback deve simular estrutura de formulário real', () => {
      const { container } = render(<FormLoadingFallback />)

      // Deve ter hierarquia visual similar a um formulário
      const formContainer = container.firstChild as HTMLElement
      expect(formContainer).toHaveClass('space-y-6')

      // Campos devem ter espaçamento interno consistente
      const fieldGroups = container.querySelectorAll('.space-y-3')
      expect(fieldGroups).toHaveLength(3)
    })
  })

  describe('Performance e Renderização', () => {
    it('componentes devem renderizar rapidamente', () => {
      const startTime = performance.now()

      render(<LoadingFallback />)
      render(<FormLoadingFallback />)
      render(<LoadingSpinner />)
      render(<ButtonLoadingSpinner />)

      const endTime = performance.now()

      // Ambiente de CI pode ser mais lento, aceitar até 200ms
      expect(endTime - startTime).toBeLessThan(200)
    })

    it('deve gerar markup consistente', () => {
      const { container: container1 } = render(<LoadingSpinner size="md" />)
      const { container: container2 } = render(<LoadingSpinner size="md" />)

      expect(container1.innerHTML).toBe(container2.innerHTML)
    })

    it('deve manter estado visual durante re-renders', () => {
      const { container, rerender } = render(
        <LoadingFallback message="Carregando..." />,
      )

      const initialHTML = container.innerHTML

      rerender(<LoadingFallback message="Carregando..." />)

      expect(container.innerHTML).toBe(initialHTML)
    })
  })

  describe('Variações de Props', () => {
    it('LoadingSpinner deve lidar com props undefined', () => {
      const { container } = render(<LoadingSpinner size={undefined} />)

      const spinner = container.firstChild as HTMLElement
      expect(spinner).toHaveClass('h-8', 'w-8') // Deve usar padrão 'md'
    })

    it('LoadingFallback deve lidar com message vazia', () => {
      const { container } = render(<LoadingFallback message="" />)

      const messageSpan = container.querySelector('span.text-gray-600')
      expect(messageSpan).toBeInTheDocument()
      expect(messageSpan).toHaveTextContent('')
    })

    it('ButtonLoadingSpinner deve funcionar sem props', () => {
      const { container } = render(<ButtonLoadingSpinner />)

      const spinner = container.firstChild as HTMLElement
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('h-4', 'w-4')
    })
  })
})
