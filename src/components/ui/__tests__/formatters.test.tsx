import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import {
  CurrencyDisplay,
  DateDisplay,
  DocumentDisplay,
  CNPJDisplay,
  CEPDisplay,
  PhoneDisplay,
} from '@/components/ui/formatters'

describe('CurrencyDisplay', () => {
  it('renderiza valores válidos', () => {
    render(<CurrencyDisplay value={1234.56} />)
    expect(screen.getByText(/1\.234,56/)).toBeInTheDocument()
  })

  it('usa fallback para null/undefined', () => {
    render(<CurrencyDisplay value={null} fallback="N/A" />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('respeita showZero=false', () => {
    render(<CurrencyDisplay value={0} showZero={false} fallback="-" />)
    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('aplica classes CSS e fonte monospaced', () => {
    render(<CurrencyDisplay value={10} className="text-red-500" />)
    const el = screen.getByText(/10,00/).closest('span')
    expect(el).toHaveClass('text-red-500')
    expect(el).toHaveClass('font-mono')
  })
})

describe('DateDisplay', () => {
  it('formato default (dateUtils.formatarDataUTC)', () => {
    render(<DateDisplay value="2031-09-01T00:00:00" />)
    expect(screen.getByText('01/09/2031')).toBeInTheDocument()
  })

  it('formato custom com opções específicas', () => {
    render(
      <DateDisplay
        value="2031-09-01T00:00:00"
        format="custom"
        options={{ day: '2-digit', month: 'long', year: 'numeric' }}
      />,
    )
    // Deve conter o mês por extenso em pt-BR
    expect(screen.getByText(/setembro/i)).toBeInTheDocument()
  })

  it('formato datetime (toLocaleString)', () => {
    render(<DateDisplay value="2031-09-01T00:00:00Z" format="datetime" />)
    // Conteúdo não-vazio e contendo o ano
    const el = screen.getByText(/2031/)
    expect(el).toBeInTheDocument()
    expect(el.textContent).not.toBe('')
  })

  it('fallback para datas inválidas', () => {
    render(<DateDisplay value="invalid-date" fallback="Inválida" />)
    expect(screen.getByText('Inválida')).toBeInTheDocument()
  })

  it('tratamento de valores null/undefined', () => {
    render(<DateDisplay value={undefined} fallback="Sem data" />)
    expect(screen.getByText('Sem data')).toBeInTheDocument()
  })
})

describe('DocumentDisplay', () => {
  it('formata CNPJ, CEP e Phone', () => {
    const { rerender } = render(
      <DocumentDisplay value="11222333000144" type="cnpj" />,
    )
    expect(screen.getByText('11.222.333/0001-44')).toBeInTheDocument()

    rerender(<DocumentDisplay value="12345678" type="cep" />)
    expect(screen.getByText('12345-678')).toBeInTheDocument()

    rerender(<DocumentDisplay value="11987654321" type="phone" />)
    expect(screen.getByText('(11) 98765-4321')).toBeInTheDocument()
  })

  it('usa fallback ao receber valor vazio', () => {
    render(<DocumentDisplay value={null} type="cep" fallback="N/A" />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('aplica fonte monospaced', () => {
    render(<DocumentDisplay value="12345678" type="cep" />)
    const el = screen.getByText('12345-678').closest('span')
    expect(el).toHaveClass('font-mono')
  })
})

describe('Convenience displays (CNPJ/CEP/Phone)', () => {
  it('CNPJDisplay, CEPDisplay e PhoneDisplay aplicam fallbacks específicos', () => {
    const { rerender } = render(<CNPJDisplay value={null} />)
    // Não depender de acentuação exata no fallback interno
    expect(screen.getByText(/CNPJ/i)).toBeInTheDocument()

    rerender(<CEPDisplay value={null} />)
    expect(screen.getByText(/CEP/i)).toBeInTheDocument()

    rerender(<PhoneDisplay value={null} />)
    expect(screen.getByText(/Telefone/i)).toBeInTheDocument()
  })
})
