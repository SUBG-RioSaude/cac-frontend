export interface Usuario {
    id: string
    matricula: string
    nome: string
    email: string
    cargo: string
    departamento: string
    telefone: string
    status: "ativo" | "inativo"
  }
  
  export const usuariosMock: Usuario[] = [
    {
      id: "1",
      matricula: "12345",
      nome: "João Silva Santos",
      email: "joao.silva@hospital.gov.br",
      cargo: "Analista de Contratos",
      departamento: "Departamento de Contratos",
      telefone: "(11) 99999-1234",
      status: "ativo",
    },
    {
      id: "2",
      matricula: "12346",
      nome: "Maria Oliveira Costa",
      email: "maria.oliveira@hospital.gov.br",
      cargo: "Gerente de Fiscalização",
      departamento: "Departamento de Fiscalização",
      telefone: "(11) 99999-5678",
      status: "ativo",
    },
    {
      id: "3",
      matricula: "12347",
      nome: "Carlos Eduardo Pereira",
      email: "carlos.pereira@hospital.gov.br",
      cargo: "Coordenador de Gestão",
      departamento: "Departamento de Gestão",
      telefone: "(11) 99999-9012",
      status: "ativo",
    },
    {
      id: "4",
      matricula: "12348",
      nome: "Ana Paula Rodrigues",
      email: "ana.rodrigues@hospital.gov.br",
      cargo: "Analista Jurídico",
      departamento: "Departamento Jurídico",
      telefone: "(11) 99999-3456",
      status: "ativo",
    },
    {
      id: "5",
      matricula: "12349",
      nome: "Roberto Almeida Lima",
      email: "roberto.lima@hospital.gov.br",
      cargo: "Supervisor de Contratos",
      departamento: "Departamento de Contratos",
      telefone: "(11) 99999-7890",
      status: "ativo",
    },
    {
      id: "6",
      matricula: "12350",
      nome: "Fernanda Santos Souza",
      email: "fernanda.souza@hospital.gov.br",
      cargo: "Analista de Compliance",
      departamento: "Departamento de Compliance",
      telefone: "(11) 99999-2468",
      status: "ativo",
    },
    {
      id: "7",
      matricula: "12351",
      nome: "Paulo Henrique Martins",
      email: "paulo.martins@hospital.gov.br",
      cargo: "Gestor de Projetos",
      departamento: "Departamento de Projetos",
      telefone: "(11) 99999-1357",
      status: "ativo",
    },
    {
      id: "8",
      matricula: "12352",
      nome: "Juliana Ferreira Dias",
      email: "juliana.dias@hospital.gov.br",
      cargo: "Analista Financeiro",
      departamento: "Departamento Financeiro",
      telefone: "(11) 99999-8024",
      status: "ativo",
    },
  ]