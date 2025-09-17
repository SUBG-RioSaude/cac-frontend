// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Permitir body mais longo para commits detalhados
    'body-max-line-length': [0, 'always'],
    // Permitir footer mais longo para links e referencias
    'footer-max-line-length': [0, 'always'],
    // Tipos permitidos customizados para nosso projeto
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nova funcionalidade
        'fix',      // Correção de bug
        'docs',     // Documentação
        'style',    // Formatação, sem mudança de lógica
        'refactor', // Refatoração sem nova funcionalidade ou bug fix
        'perf',     // Melhoria de performance
        'test',     // Adição ou correção de testes
        'build',    // Mudanças no sistema de build
        'ci',       // Mudanças no CI/CD
        'chore',    // Tarefas de manutenção
        'revert',   // Reversão de commit
        'hotfix',   // Correção crítica
        'wip',      // Work in progress (desenvolvimento)
      ],
    ],
    // Subject deve ser em minúscula e sem ponto final
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-full-stop': [2, 'never', '.'],
    // Subject deve ter no mínimo 3 caracteres
    'subject-min-length': [2, 'always', 3],
    // Header não pode passar de 100 caracteres
    'header-max-length': [2, 'always', 100],
  },
}