/**
 * Sistema de métricas para monitoramento do fallback da API
 */

interface ApiMetrics {
  gatewaySuccess: number
  gatewayFailure: number
  directSuccess: number
  directFailure: number
  totalRequests: number
  lastFailureTime?: Date
  lastFailureReason?: string
}

class ApiMetricsCollector {
  private metrics: ApiMetrics = {
    gatewaySuccess: 0,
    gatewayFailure: 0,
    directSuccess: 0,
    directFailure: 0,
    totalRequests: 0
  }

  recordGatewaySuccess() {
    this.metrics.gatewaySuccess++
    this.metrics.totalRequests++
    this.logMetrics('Gateway Success')
  }

  recordGatewayFailure(reason: string) {
    this.metrics.gatewayFailure++
    this.metrics.totalRequests++
    this.metrics.lastFailureTime = new Date()
    this.metrics.lastFailureReason = reason
    this.logMetrics('Gateway Failure', { reason })
  }

  recordDirectSuccess() {
    this.metrics.directSuccess++
    this.logMetrics('Direct Success (Fallback)')
  }

  recordDirectFailure(reason: string) {
    this.metrics.directFailure++
    this.metrics.lastFailureTime = new Date()
    this.metrics.lastFailureReason = reason
    this.logMetrics('Direct Failure', { reason })
  }

  getMetrics(): ApiMetrics & { 
    gatewaySuccessRate: number
    fallbackUsageRate: number
    overallSuccessRate: number
  } {
    const gatewaySuccessRate = this.metrics.totalRequests > 0 
      ? (this.metrics.gatewaySuccess / this.metrics.totalRequests) * 100 
      : 0

    const fallbackUsageRate = this.metrics.totalRequests > 0 
      ? ((this.metrics.directSuccess + this.metrics.directFailure) / this.metrics.totalRequests) * 100 
      : 0

    const overallSuccessRate = this.metrics.totalRequests > 0 
      ? ((this.metrics.gatewaySuccess + this.metrics.directSuccess) / this.metrics.totalRequests) * 100 
      : 0

    return {
      ...this.metrics,
      gatewaySuccessRate: Number(gatewaySuccessRate.toFixed(2)),
      fallbackUsageRate: Number(fallbackUsageRate.toFixed(2)),
      overallSuccessRate: Number(overallSuccessRate.toFixed(2))
    }
  }

  private logMetrics(event: string, details?: Record<string, unknown>) {
    const timestamp = new Date().toISOString()
    const metrics = this.getMetrics()
    
    console.log(`[API-METRICS] ${timestamp} - ${event}`, {
      event,
      details,
      summary: {
        total: metrics.totalRequests,
        gatewaySuccess: `${metrics.gatewaySuccessRate}%`,
        fallbackUsage: `${metrics.fallbackUsageRate}%`,
        overallSuccess: `${metrics.overallSuccessRate}%`
      }
    })
  }

  reset() {
    this.metrics = {
      gatewaySuccess: 0,
      gatewayFailure: 0,
      directSuccess: 0,
      directFailure: 0,
      totalRequests: 0
    }
  }

  // Método para exibir relatório no console
  printReport() {
    const metrics = this.getMetrics()
    
    console.group('📊 API Fallback Report')
    console.log('Total de requisições:', metrics.totalRequests)
    console.log('Gateway - Sucessos:', metrics.gatewaySuccess)
    console.log('Gateway - Falhas:', metrics.gatewayFailure)
    console.log('Direto - Sucessos:', metrics.directSuccess)
    console.log('Direto - Falhas:', metrics.directFailure)
    console.log('Taxa de sucesso do Gateway:', `${metrics.gatewaySuccessRate}%`)
    console.log('Taxa de uso do Fallback:', `${metrics.fallbackUsageRate}%`)
    console.log('Taxa de sucesso geral:', `${metrics.overallSuccessRate}%`)
    
    if (metrics.lastFailureTime) {
      console.log('Última falha:', metrics.lastFailureTime.toLocaleString())
      console.log('Motivo da última falha:', metrics.lastFailureReason)
    }
    
    console.groupEnd()
  }
}

// Instância singleton
export const apiMetrics = new ApiMetricsCollector()

// Expor no window para debug (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  (window as { apiMetrics?: ApiMetricsCollector }).apiMetrics = apiMetrics
}