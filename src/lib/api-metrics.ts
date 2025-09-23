/**
 * Sistema de métricas para monitoramento do fallback da API
 */
import { createServiceLogger } from './logger'

const logger = createServiceLogger('api-metrics')

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
    totalRequests: 0,
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
    const gatewaySuccessRate =
      this.metrics.totalRequests > 0
        ? (this.metrics.gatewaySuccess / this.metrics.totalRequests) * 100
        : 0

    const fallbackUsageRate =
      this.metrics.totalRequests > 0
        ? ((this.metrics.directSuccess + this.metrics.directFailure) /
            this.metrics.totalRequests) *
          100
        : 0

    const overallSuccessRate =
      this.metrics.totalRequests > 0
        ? ((this.metrics.gatewaySuccess + this.metrics.directSuccess) /
            this.metrics.totalRequests) *
          100
        : 0

    return {
      ...this.metrics,
      gatewaySuccessRate: Number(gatewaySuccessRate.toFixed(2)),
      fallbackUsageRate: Number(fallbackUsageRate.toFixed(2)),
      overallSuccessRate: Number(overallSuccessRate.toFixed(2)),
    }
  }

  private logMetrics(event: string, details?: Record<string, unknown>) {
    const metrics = this.getMetrics()

    logger.info(
      {
        event,
        details,
        metrics: {
          total: metrics.totalRequests,
          gateway: {
            success: metrics.gatewaySuccess,
            failure: metrics.gatewayFailure,
            successRate: metrics.gatewaySuccessRate,
          },
          direct: {
            success: metrics.directSuccess,
            failure: metrics.directFailure,
          },
          fallbackUsageRate: metrics.fallbackUsageRate,
          overallSuccessRate: metrics.overallSuccessRate,
          lastFailure: metrics.lastFailureTime?.toISOString(),
          lastFailureReason: metrics.lastFailureReason,
        },
      },
      `API Metrics - ${event}`,
    )
  }

  reset() {
    this.metrics = {
      gatewaySuccess: 0,
      gatewayFailure: 0,
      directSuccess: 0,
      directFailure: 0,
      totalRequests: 0,
    }
  }

  // Método para exibir relatório completo
  printReport() {
    const metrics = this.getMetrics()

    logger.info(
      {
        report: 'api_fallback_complete',
        totalRequests: metrics.totalRequests,
        gateway: {
          success: metrics.gatewaySuccess,
          failure: metrics.gatewayFailure,
          successRate: `${metrics.gatewaySuccessRate}%`,
        },
        direct: {
          success: metrics.directSuccess,
          failure: metrics.directFailure,
        },
        rates: {
          gatewaySuccessRate: `${metrics.gatewaySuccessRate}%`,
          fallbackUsageRate: `${metrics.fallbackUsageRate}%`,
          overallSuccessRate: `${metrics.overallSuccessRate}%`,
        },
        lastFailure: metrics.lastFailureTime
          ? {
              time: metrics.lastFailureTime.toISOString(),
              localTime: metrics.lastFailureTime.toLocaleString(),
              reason: metrics.lastFailureReason,
            }
          : null,
      },
      '📊 API Fallback Report Completo',
    )
  }
}

// Instância singleton
export const apiMetrics = new ApiMetricsCollector()

// Expor no window para debug (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  ;(window as { apiMetrics?: ApiMetricsCollector }).apiMetrics = apiMetrics
}
