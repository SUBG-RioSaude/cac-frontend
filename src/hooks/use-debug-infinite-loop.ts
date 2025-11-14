import { useEffect, useRef } from 'react'

/**
 * Hook de debugging para detectar loops infinitos
 *
 * USO:
 * ```tsx
 * useDebugInfiniteLoop('ContratosPage', { filtros, paginacao, contratos })
 * ```
 *
 * Isso imprimirá no console:
 * - Quantas vezes o componente renderizou
 * - Quais valores mudaram entre renders
 * - Alerta quando detectar possível loop (>20 renders em 1s)
 */
export const useDebugInfiniteLoop = (
  componentName: string,
  values: Record<string, any>,
) => {
  const renderCount = useRef(0)
  const previousValues = useRef<Record<string, any>>(values)
  const renderTimestamps = useRef<number[]>([])

  useEffect(() => {
    renderCount.current += 1
    const now = Date.now()
    renderTimestamps.current.push(now)

    // Manter apenas timestamps do último segundo
    renderTimestamps.current = renderTimestamps.current.filter(
      (timestamp) => now - timestamp < 1000,
    )

    // Detectar possível loop (mais de 20 renders em 1 segundo)
    if (renderTimestamps.current.length > 20) {
      console.error(
        `🔴 LOOP INFINITO DETECTADO em ${componentName}!`,
        `${renderTimestamps.current.length} renders no último segundo`,
      )
    }

    // Identificar quais valores mudaram
    const changedValues: Record<string, { old: any; new: any }> = {}
    Object.keys(values).forEach((key) => {
      if (previousValues.current[key] !== values[key]) {
        changedValues[key] = {
          old: previousValues.current[key],
          new: values[key],
        }
      }
    })

    // Log detalhado
    console.group(
      `🔍 [${componentName}] Render #${renderCount.current} ${
        renderTimestamps.current.length > 10 ? '⚠️ SUSPEITO' : ''
      }`,
    )
    console.log(
      '📊 Renders no último segundo:',
      renderTimestamps.current.length,
    )

    if (Object.keys(changedValues).length > 0) {
      console.log('🔄 Valores que mudaram:', changedValues)
    } else {
      console.log('✅ Nenhum valor monitorado mudou')
    }

    console.log('📦 Estado atual:', values)
    console.groupEnd()

    // Atualizar valores anteriores
    previousValues.current = values
  })

  return renderCount.current
}
