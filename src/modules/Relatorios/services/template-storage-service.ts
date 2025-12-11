/**
 * ==========================================
 * SERVICE DE TEMPLATES DE RELATÓRIOS
 * ==========================================
 * Gerenciamento de templates personalizados usando IndexedDB
 */

import localforage from 'localforage'
import type {
  TemplateRelatorio,
  FiltrosTemplate,
  ResultadoOperacaoTemplate,
  TEMPLATE_PADRAO_EXECUCAO,
  TEMPLATE_PADRAO_DESEMPENHO,
  TEMPLATE_PADRAO_CHECKLIST,
} from '../types/template'
import type { TipoRelatorio } from '../types/relatorio'

// ========== CONFIGURAÇÃO DO INDEXEDDB ==========

const templatesDB = localforage.createInstance({
  name: 'cac-relatorios',
  storeName: 'templates',
  description: 'Templates personalizados de relatórios',
})

// ========== FUNÇÕES PRINCIPAIS ==========

/**
 * Salva um template
 */
export const salvarTemplate = async (
  template: TemplateRelatorio,
): Promise<ResultadoOperacaoTemplate> => {
  try {
    // Atualizar data de atualização
    const templateAtualizado: TemplateRelatorio = {
      ...template,
      dataAtualizacao: new Date().toISOString(),
    }

    await templatesDB.setItem(template.id, templateAtualizado)

    return {
      sucesso: true,
      mensagem: 'Template salvo com sucesso',
      template: templateAtualizado,
    }
  } catch (erro) {
    console.error('Erro ao salvar template:', erro)
    return {
      sucesso: false,
      mensagem: 'Erro ao salvar template',
      erro: erro instanceof Error ? erro.message : 'Erro desconhecido',
    }
  }
}

/**
 * Lista templates com filtros
 */
export const listarTemplates = async (
  filtros?: FiltrosTemplate,
): Promise<TemplateRelatorio[]> => {
  try {
    const keys = await templatesDB.keys()
    const templates = await Promise.all(
      keys.map((key) => templatesDB.getItem<TemplateRelatorio>(key)),
    )

    // Filtrar nulls
    let templatesFiltrados = templates.filter(
      (t): t is TemplateRelatorio => t !== null,
    )

    // Aplicar filtros
    if (filtros) {
      templatesFiltrados = aplicarFiltros(templatesFiltrados, filtros)
    }

    // Ordenar: padrão primeiro, depois por data de criação
    return templatesFiltrados.sort((a, b) => {
      if (a.padrao && !b.padrao) return -1
      if (!a.padrao && b.padrao) return 1
      return (
        new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
      )
    })
  } catch (erro) {
    console.error('Erro ao listar templates:', erro)
    return []
  }
}

/**
 * Busca um template por ID
 */
export const buscarTemplate = async (
  id: string,
): Promise<TemplateRelatorio | null> => {
  try {
    return await templatesDB.getItem<TemplateRelatorio>(id)
  } catch (erro) {
    console.error('Erro ao buscar template:', erro)
    return null
  }
}

/**
 * Busca template padrão para um tipo de relatório
 */
export const buscarTemplatePadrao = async (
  tipoRelatorio: TipoRelatorio,
): Promise<TemplateRelatorio | null> => {
  try {
    const templates = await listarTemplates({
      tipoRelatorio,
      padrao: true,
    })

    return templates.length > 0 ? templates[0] : null
  } catch (erro) {
    console.error('Erro ao buscar template padrão:', erro)
    return null
  }
}

/**
 * Exclui um template
 */
export const excluirTemplate = async (
  id: string,
): Promise<ResultadoOperacaoTemplate> => {
  try {
    const template = await templatesDB.getItem<TemplateRelatorio>(id)

    if (!template) {
      return {
        sucesso: false,
        mensagem: 'Template não encontrado',
      }
    }

    // Não permitir excluir templates padrão
    if (template.padrao) {
      return {
        sucesso: false,
        mensagem: 'Templates padrão do sistema não podem ser excluídos',
      }
    }

    await templatesDB.removeItem(id)

    return {
      sucesso: true,
      mensagem: 'Template excluído com sucesso',
    }
  } catch (erro) {
    console.error('Erro ao excluir template:', erro)
    return {
      sucesso: false,
      mensagem: 'Erro ao excluir template',
      erro: erro instanceof Error ? erro.message : 'Erro desconhecido',
    }
  }
}

/**
 * Duplica um template
 */
export const duplicarTemplate = async (
  id: string,
  novoNome?: string,
): Promise<ResultadoOperacaoTemplate> => {
  try {
    const templateOriginal = await templatesDB.getItem<TemplateRelatorio>(id)

    if (!templateOriginal) {
      return {
        sucesso: false,
        mensagem: 'Template não encontrado',
      }
    }

    const novoTemplate: TemplateRelatorio = {
      ...templateOriginal,
      id: gerarIdTemplate(),
      nome: novoNome || `${templateOriginal.nome} (Cópia)`,
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      padrao: false,
      compartilhado: false,
    }

    await templatesDB.setItem(novoTemplate.id, novoTemplate)

    return {
      sucesso: true,
      mensagem: 'Template duplicado com sucesso',
      template: novoTemplate,
    }
  } catch (erro) {
    console.error('Erro ao duplicar template:', erro)
    return {
      sucesso: false,
      mensagem: 'Erro ao duplicar template',
      erro: erro instanceof Error ? erro.message : 'Erro desconhecido',
    }
  }
}

/**
 * Favorita ou desfavorita um template
 */
export const toggleFavoritoTemplate = async (
  id: string,
): Promise<ResultadoOperacaoTemplate> => {
  try {
    const template = await templatesDB.getItem<TemplateRelatorio>(id)

    if (!template) {
      return {
        sucesso: false,
        mensagem: 'Template não encontrado',
      }
    }

    const templateAtualizado: TemplateRelatorio = {
      ...template,
      favoritado: !template.favoritado,
      dataAtualizacao: new Date().toISOString(),
    }

    await templatesDB.setItem(id, templateAtualizado)

    return {
      sucesso: true,
      mensagem: templateAtualizado.favoritado
        ? 'Template adicionado aos favoritos'
        : 'Template removido dos favoritos',
      template: templateAtualizado,
    }
  } catch (erro) {
    console.error('Erro ao favoritar template:', erro)
    return {
      sucesso: false,
      mensagem: 'Erro ao favoritar template',
      erro: erro instanceof Error ? erro.message : 'Erro desconhecido',
    }
  }
}

/**
 * Exporta um template como JSON
 */
export const exportarTemplate = async (
  id: string,
): Promise<ResultadoOperacaoTemplate> => {
  try {
    const template = await templatesDB.getItem<TemplateRelatorio>(id)

    if (!template) {
      return {
        sucesso: false,
        mensagem: 'Template não encontrado',
      }
    }

    const json = JSON.stringify(template, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `template-${template.nome.replace(/\s+/g, '-')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return {
      sucesso: true,
      mensagem: 'Template exportado com sucesso',
      template,
    }
  } catch (erro) {
    console.error('Erro ao exportar template:', erro)
    return {
      sucesso: false,
      mensagem: 'Erro ao exportar template',
      erro: erro instanceof Error ? erro.message : 'Erro desconhecido',
    }
  }
}

/**
 * Importa um template de arquivo JSON
 */
export const importarTemplate = async (
  arquivo: File,
  usuarioId: string,
): Promise<ResultadoOperacaoTemplate> => {
  try {
    const textoJson = await arquivo.text()
    const templateImportado = JSON.parse(textoJson) as TemplateRelatorio

    // Validar estrutura básica
    if (!templateImportado.nome || !templateImportado.tipoRelatorio) {
      return {
        sucesso: false,
        mensagem: 'Arquivo de template inválido',
      }
    }

    // Criar novo template com novo ID e usuário atual
    const novoTemplate: TemplateRelatorio = {
      ...templateImportado,
      id: gerarIdTemplate(),
      usuarioId,
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      padrao: false, // Templates importados nunca são padrão
    }

    await templatesDB.setItem(novoTemplate.id, novoTemplate)

    return {
      sucesso: true,
      mensagem: 'Template importado com sucesso',
      template: novoTemplate,
    }
  } catch (erro) {
    console.error('Erro ao importar template:', erro)
    return {
      sucesso: false,
      mensagem: 'Erro ao importar template. Verifique se o arquivo é válido.',
      erro: erro instanceof Error ? erro.message : 'Erro desconhecido',
    }
  }
}

/**
 * Limpa todos os templates (exceto padrão)
 */
export const limparTemplates = async (): Promise<ResultadoOperacaoTemplate> => {
  try {
    const templates = await listarTemplates()

    for (const template of templates) {
      if (!template.padrao) {
        await templatesDB.removeItem(template.id)
      }
    }

    return {
      sucesso: true,
      mensagem: 'Templates limpos com sucesso',
    }
  } catch (erro) {
    console.error('Erro ao limpar templates:', erro)
    return {
      sucesso: false,
      mensagem: 'Erro ao limpar templates',
      erro: erro instanceof Error ? erro.message : 'Erro desconhecido',
    }
  }
}

// ========== FUNÇÕES AUXILIARES ==========

/**
 * Aplica filtros aos templates
 */
const aplicarFiltros = (
  templates: TemplateRelatorio[],
  filtros: FiltrosTemplate,
): TemplateRelatorio[] => {
  let resultado = templates

  if (filtros.tipoRelatorio) {
    resultado = resultado.filter((t) => t.tipoRelatorio === filtros.tipoRelatorio)
  }

  if (filtros.usuarioId) {
    resultado = resultado.filter((t) => t.usuarioId === filtros.usuarioId)
  }

  if (filtros.padrao !== undefined) {
    resultado = resultado.filter((t) => t.padrao === filtros.padrao)
  }

  if (filtros.compartilhado !== undefined) {
    resultado = resultado.filter((t) => t.compartilhado === filtros.compartilhado)
  }

  if (filtros.favoritado !== undefined) {
    resultado = resultado.filter((t) => t.favoritado === filtros.favoritado)
  }

  if (filtros.termoPesquisa) {
    const termo = filtros.termoPesquisa.toLowerCase()
    resultado = resultado.filter(
      (t) =>
        t.nome.toLowerCase().includes(termo) ||
        t.descricao?.toLowerCase().includes(termo),
    )
  }

  return resultado
}

/**
 * Gera ID único para template
 */
const gerarIdTemplate = (): string => {
  return `template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// ========== INICIALIZAÇÃO ==========

/**
 * Inicializa templates padrão se não existirem
 */
export const inicializarTemplatesPadrao = async (
  usuarioId: string,
): Promise<void> => {
  try {
    const templatesExistentes = await listarTemplates({ padrao: true })

    if (templatesExistentes.length === 0) {
      // Criar templates padrão
      const templatesPadrao = [
        {
          ...TEMPLATE_PADRAO_EXECUCAO,
          id: 'template_padrao_execucao',
          usuarioId,
          dataCriacao: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString(),
        } as TemplateRelatorio,
        {
          ...TEMPLATE_PADRAO_DESEMPENHO,
          id: 'template_padrao_desempenho',
          usuarioId,
          dataCriacao: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString(),
        } as TemplateRelatorio,
        {
          ...TEMPLATE_PADRAO_CHECKLIST,
          id: 'template_padrao_checklist_formalizacao',
          usuarioId,
          dataCriacao: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString(),
        } as TemplateRelatorio,
      ]

      for (const template of templatesPadrao) {
        await templatesDB.setItem(template.id, template)
      }

      console.log('Templates padrão inicializados com sucesso')
    }
  } catch (erro) {
    console.error('Erro ao inicializar templates padrão:', erro)
  }
}
