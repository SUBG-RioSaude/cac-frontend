import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { Avatar, AvatarImage, AvatarFallback } from '../avatar'

// Mock simples para testes
beforeEach(() => {
  vi.clearAllMocks()
})

describe('Avatar Components', () => {
  describe('Avatar', () => {
    it('deve renderizar corretamente', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      const avatar = screen.getByTestId('avatar')
      expect(avatar).toBeInTheDocument()
    })

    it('deve aplicar classes padrão', () => {
      render(<Avatar data-testid="avatar" />)

      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass(
        'relative',
        'flex',
        'size-8',
        'shrink-0',
        'overflow-hidden',
        'rounded-full',
      )
    })

    it('deve ter data-slot="avatar"', () => {
      render(<Avatar data-testid="avatar" />)

      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveAttribute('data-slot', 'avatar')
    })

    it('deve aceitar className customizada', () => {
      render(<Avatar className="custom-avatar" data-testid="avatar" />)

      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('custom-avatar')
    })

    it('deve aceitar props do Radix Avatar', () => {
      render(<Avatar data-testid="avatar" aria-label="User avatar" />)

      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveAttribute('aria-label', 'User avatar')
    })
  })

  describe('AvatarImage', () => {
    it('deve ser renderizado dentro de Avatar', () => {
      // AvatarImage só aparece quando imagem carrega com sucesso
      // Em ambiente de teste, vamos verificar que o Avatar renderiza fallback
      render(
        <Avatar data-testid="avatar">
          <AvatarImage src="/test-avatar.jpg" alt="Test User" />
          <AvatarFallback data-testid="fallback">TU</AvatarFallback>
        </Avatar>,
      )

      const avatar = screen.getByTestId('avatar')
      const fallback = screen.getByTestId('fallback')

      expect(avatar).toBeInTheDocument()
      expect(fallback).toBeInTheDocument()
      expect(fallback).toHaveTextContent('TU')
    })

    it('deve aceitar props corretas', () => {
      // Teste estrutural - verifica que componente aceita props corretas
      expect(() => {
        render(
          <Avatar>
            <AvatarImage src="/test.jpg" alt="Test" className="custom-class" />
            <AvatarFallback>T</AvatarFallback>
          </Avatar>,
        )
      }).not.toThrow()
    })
  })

  describe('AvatarFallback', () => {
    it('deve renderizar fallback corretamente', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="avatar-fallback">JD</AvatarFallback>
        </Avatar>,
      )

      const fallback = screen.getByTestId('avatar-fallback')
      expect(fallback).toBeInTheDocument()
      expect(fallback).toHaveTextContent('JD')
    })

    it('deve aplicar classes padrão', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="avatar-fallback">JD</AvatarFallback>
        </Avatar>,
      )

      const fallback = screen.getByTestId('avatar-fallback')
      expect(fallback).toHaveClass(
        'bg-muted',
        'flex',
        'size-full',
        'items-center',
        'justify-center',
        'rounded-full',
      )
    })

    it('deve ter data-slot="avatar-fallback"', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="avatar-fallback">JD</AvatarFallback>
        </Avatar>,
      )

      const fallback = screen.getByTestId('avatar-fallback')
      expect(fallback).toHaveAttribute('data-slot', 'avatar-fallback')
    })

    it('deve aceitar className customizada', () => {
      render(
        <Avatar>
          <AvatarFallback
            className="custom-fallback"
            data-testid="avatar-fallback"
          >
            JD
          </AvatarFallback>
        </Avatar>,
      )

      const fallback = screen.getByTestId('avatar-fallback')
      expect(fallback).toHaveClass('custom-fallback')
    })
  })

  describe('Avatar Composition', () => {
    it('deve renderizar avatar com fallback', () => {
      render(
        <Avatar data-testid="complete-avatar">
          <AvatarImage src="/user.jpg" alt="John Doe" />
          <AvatarFallback data-testid="avatar-fallback">JD</AvatarFallback>
        </Avatar>,
      )

      const avatar = screen.getByTestId('complete-avatar')
      const fallback = screen.getByTestId('avatar-fallback')

      expect(avatar).toBeInTheDocument()
      expect(fallback).toBeInTheDocument()
      expect(fallback).toHaveTextContent('JD')
    })

    it('deve mostrar apenas fallback quando não há imagem', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="avatar-fallback">JD</AvatarFallback>
        </Avatar>,
      )

      const fallback = screen.getByTestId('avatar-fallback')
      expect(fallback).toBeInTheDocument()
      expect(fallback).toHaveTextContent('JD')
    })

    it('deve manter estrutura semântica correta', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarImage src="/test.jpg" alt="Test" />
          <AvatarFallback>T</AvatarFallback>
        </Avatar>,
      )

      const avatar = screen.getByTestId('avatar')
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('Diferentes tamanhos e estilos', () => {
    it('deve aceitar tamanhos customizados', () => {
      render(
        <Avatar className="size-12" data-testid="large-avatar">
          <AvatarFallback>LG</AvatarFallback>
        </Avatar>,
      )

      const avatar = screen.getByTestId('large-avatar')
      expect(avatar).toHaveClass('size-12')
    })

    it('deve aceitar estilos customizados no fallback', () => {
      render(
        <Avatar>
          <AvatarFallback
            className="bg-blue-500 font-bold text-white"
            data-testid="custom-fallback"
          >
            CB
          </AvatarFallback>
        </Avatar>,
      )

      const fallback = screen.getByTestId('custom-fallback')
      expect(fallback).toHaveClass('bg-blue-500', 'text-white', 'font-bold')
    })
  })

  describe('Casos de uso comuns', () => {
    it('deve renderizar iniciais de usuário', () => {
      render(
        <Avatar>
          <AvatarFallback>MB</AvatarFallback>
        </Avatar>,
      )

      expect(screen.getByText('MB')).toBeInTheDocument()
    })

    it('deve renderizar com ícone como fallback', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="icon-fallback">
            <svg width="16" height="16" data-testid="user-icon">
              <circle cx="8" cy="8" r="8" />
            </svg>
          </AvatarFallback>
        </Avatar>,
      )

      expect(screen.getByTestId('user-icon')).toBeInTheDocument()
    })

    it('deve funcionar com diferentes formatos de nome', () => {
      const names = [
        { name: 'João Silva', initials: 'JS' },
        { name: 'Maria', initials: 'M' },
        { name: 'Pedro Paulo Santos', initials: 'PS' }, // Pega primeira e última
      ]

      names.forEach(({ initials }, index) => {
        render(
          <Avatar key={index}>
            <AvatarFallback data-testid={`fallback-${index}`}>
              {initials}
            </AvatarFallback>
          </Avatar>,
        )

        expect(screen.getByTestId(`fallback-${index}`)).toHaveTextContent(
          initials,
        )
      })
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter suporte para screen readers', () => {
      render(
        <Avatar aria-label="User profile picture">
          <AvatarImage src="/user.jpg" alt="John Doe" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      const avatar = screen.getByLabelText('User profile picture')
      expect(avatar).toBeInTheDocument()
    })

    it('deve aceitar props de acessibilidade na imagem', () => {
      // Teste estrutural - verifica que AvatarImage aceita props de acessibilidade
      expect(() => {
        render(
          <Avatar>
            <AvatarImage src="/user.jpg" alt="Profile picture of John Doe" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>,
        )
      }).not.toThrow()
    })

    it('deve ter role apropriado quando necessário', () => {
      render(
        <Avatar role="img" aria-label="User avatar">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>,
      )

      const avatar = screen.getByRole('img')
      expect(avatar).toHaveAttribute('aria-label', 'User avatar')
    })
  })
})
