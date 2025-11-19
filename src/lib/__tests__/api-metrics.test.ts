import { describe, it, expect, vi, afterEach } from 'vitest'

type ApiMetricsInstance = typeof import('@/lib/api-metrics')['apiMetrics']

const importarApiMetrics = async (
  modoDev: 'true' | 'false' = 'false',
): Promise<ApiMetricsInstance> => {
  vi.resetModules()
  vi.stubEnv('DEV', modoDev)
  const modulo = await import('@/lib/api-metrics')
  return modulo.apiMetrics
}

afterEach(() => {
  vi.unstubAllEnvs()
  delete (window as { apiMetrics?: ApiMetricsInstance }).apiMetrics
})

describe('apiMetrics collector', () => {
  it('deve contabilizar sucessos e falhas de gateway com métricas derivadas', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const apiMetrics = await importarApiMetrics()

    apiMetrics.recordGatewaySuccess()
    apiMetrics.recordGatewayFailure('Timeout no gateway')

    const resultado = apiMetrics.getMetrics()

    expect(resultado.gatewaySuccess).toBe(1)
    expect(resultado.gatewayFailure).toBe(1)
    expect(resultado.totalRequests).toBe(2)
    expect(resultado.gatewaySuccessRate).toBeCloseTo(50)
    expect(resultado.overallSuccessRate).toBeCloseTo(50)
    expect(resultado.lastFailureReason).toBe('Timeout no gateway')
    expect(resultado.lastFailureTime).toBeInstanceOf(Date)
    expect(infoSpy).toHaveBeenCalledTimes(2)

    infoSpy.mockRestore()
  })

  it('deve monitorar fluxo de fallback registrando sucessos e falhas diretas', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const apiMetrics = await importarApiMetrics()

    apiMetrics.recordGatewayFailure('Primeira tentativa')
    apiMetrics.recordDirectSuccess()
    apiMetrics.recordGatewayFailure('Segunda tentativa')
    apiMetrics.recordDirectFailure('Falha no fallback')

    const resultado = apiMetrics.getMetrics()

    expect(resultado.directSuccess).toBe(1)
    expect(resultado.directFailure).toBe(1)
    expect(resultado.fallbackUsageRate).toBe(100)
    expect(resultado.overallSuccessRate).toBe(50)
    expect(resultado.lastFailureReason).toBe('Falha no fallback')
    expect(resultado.lastFailureTime).toBeInstanceOf(Date)
    expect(infoSpy).toHaveBeenCalledTimes(4)

    infoSpy.mockRestore()
  })

  it('deve resetar métricas para o estado inicial', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const apiMetrics = await importarApiMetrics()

    apiMetrics.recordGatewaySuccess()
    apiMetrics.recordGatewayFailure('Qualquer motivo')
    apiMetrics.reset()

    const zerado = apiMetrics.getMetrics()

    expect(zerado.gatewaySuccess).toBe(0)
    expect(zerado.gatewayFailure).toBe(0)
    expect(zerado.directSuccess).toBe(0)
    expect(zerado.directFailure).toBe(0)
    expect(zerado.totalRequests).toBe(0)
    expect(zerado.lastFailureReason).toBeUndefined()
    expect(zerado.lastFailureTime).toBeUndefined()
    expect(infoSpy).toHaveBeenCalledTimes(2)

    infoSpy.mockRestore()
  })

  it('deve emitir relatório completo com os dados atuais', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const apiMetrics = await importarApiMetrics()

    apiMetrics.recordGatewaySuccess()
    apiMetrics.printReport()

    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining('📊 API Fallback Report Completo'),
    )

    infoSpy.mockRestore()
  })
})

describe('apiMetrics em modo de desenvolvimento', () => {
  it('deve expor a instância globalmente quando DEV=true', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const apiMetrics = await importarApiMetrics('true')

    expect((window as { apiMetrics?: ApiMetricsInstance }).apiMetrics).toBe(
      apiMetrics,
    )

    infoSpy.mockRestore()
  })
})

