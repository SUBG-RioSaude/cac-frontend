import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, X, Building2, MapPin, Phone, Save, UserPlus } from "lucide-react"

interface Contato {
  id: string
  nome: string
  tipo: "email" | "telefone-fixo" | "celular"
  valor: string
}

interface NovoFornecedorData {
  // Documentação
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  estado: string
  inscricaoEstadual: string
  inscricaoMunicipal: string
  // Endereço
  cep: string
  rua: string
  cidade: string
  estadoEndereco: string
  // Contatos
  contatos: Contato[]
}

const estadosBrasileiros = [
  { value: "AC", label: "AC - Acre" },
  { value: "AL", label: "AL - Alagoas" },
  { value: "AP", label: "AP - Amapá" },
  { value: "AM", label: "AM - Amazonas" },
  { value: "BA", label: "BA - Bahia" },
  { value: "CE", label: "CE - Ceará" },
  { value: "DF", label: "DF - Distrito Federal" },
  { value: "ES", label: "ES - Espírito Santo" },
  { value: "GO", label: "GO - Goiás" },
  { value: "MA", label: "MA - Maranhão" },
  { value: "MT", label: "MT - Mato Grosso" },
  { value: "MS", label: "MS - Mato Grosso do Sul" },
  { value: "MG", label: "MG - Minas Gerais" },
  { value: "PA", label: "PA - Pará" },
  { value: "PB", label: "PB - Paraíba" },
  { value: "PR", label: "PR - Paraná" },
  { value: "PE", label: "PE - Pernambuco" },
  { value: "PI", label: "PI - Piauí" },
  { value: "RJ", label: "RJ - Rio de Janeiro" },
  { value: "RN", label: "RN - Rio Grande do Norte" },
  { value: "RS", label: "RS - Rio Grande do Sul" },
  { value: "RO", label: "RO - Rondônia" },
  { value: "RR", label: "RR - Roraima" },
  { value: "SC", label: "SC - Santa Catarina" },
  { value: "SP", label: "SP - São Paulo" },
  { value: "SE", label: "SE - Sergipe" },
  { value: "TO", label: "TO - Tocantins" },
]

const tiposContato = [
  { value: "email", label: "E-mail", placeholder: "exemplo@email.com" },
  { value: "telefone-fixo", label: "Telefone Fixo", placeholder: "(11) 3333-4444" },
  { value: "celular", label: "Celular", placeholder: "(11) 99999-8888" },
]

interface ModalNovoFornecedorProps {
  onSalvar: (dados: NovoFornecedorData) => void
  children: React.ReactNode
}

export function ModalNovoFornecedor({ onSalvar, children }: ModalNovoFornecedorProps) {
  const [open, setOpen] = useState(false)
  const [dados, setDados] = useState<NovoFornecedorData>({
    cnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    estado: "",
    inscricaoEstadual: "",
    inscricaoMunicipal: "",
    cep: "",
    rua: "",
    cidade: "",
    estadoEndereco: "",
    contatos: [],
  })

  const handleAdicionarContato = () => {
    if (dados.contatos.length < 3) {
      const novoContato: Contato = {
        id: Date.now().toString(),
        nome: "",
        tipo: "email",
        valor: "",
      }
      setDados((prev) => ({
        ...prev,
        contatos: [...prev.contatos, novoContato],
      }))
    }
  }

  const handleRemoverContato = (id: string) => {
    setDados((prev) => ({
      ...prev,
      contatos: prev.contatos.filter((contato) => contato.id !== id),
    }))
  }

  const handleAtualizarContato = (id: string, campo: keyof Contato, valor: string) => {
    setDados((prev) => ({
      ...prev,
      contatos: prev.contatos.map((contato) => (contato.id === id ? { ...contato, [campo]: valor } : contato)),
    }))
  }

  const handleSalvar = () => {
    onSalvar(dados)
    setOpen(false)
    // Reset form
    setDados({
      cnpj: "",
      razaoSocial: "",
      nomeFantasia: "",
      estado: "",
      inscricaoEstadual: "",
      inscricaoMunicipal: "",
      cep: "",
      rua: "",
      cidade: "",
      estadoEndereco: "",
      contatos: [],
    })
  }

  const getPlaceholderPorTipo = (tipo: string) => {
    const tipoEncontrado = tiposContato.find((t) => t.value === tipo)
    return tipoEncontrado?.placeholder || ""
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="block w-screen max-h-[90vh] overflow-y-auto p-8">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-4 text-2xl">
            <UserPlus className="h-6 w-6" />
            Novo Fornecedor
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-10">
          {/* Documentação */}
          <Card>
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-lg">
                <Building2 className="h-5 w-5" />
                Documentação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    placeholder="00.000.000/0000-00"
                    value={dados.cnpj}
                    onChange={(e) => setDados((prev) => ({ ...prev, cnpj: e.target.value }))}
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="estado">Estado (UF) *</Label>
                  <Select
                    value={dados.estado}
                    onValueChange={(value) => setDados((prev) => ({ ...prev, estado: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosBrasileiros.map((estado) => (
                        <SelectItem key={estado.value} value={estado.value}>
                          {estado.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="razaoSocial">Razão Social *</Label>
                <Input
                  id="razaoSocial"
                  placeholder="Digite a razão social"
                  value={dados.razaoSocial}
                  onChange={(e) => setDados((prev) => ({ ...prev, razaoSocial: e.target.value }))}
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                <Input
                  id="nomeFantasia"
                  placeholder="Digite o nome fantasia"
                  value={dados.nomeFantasia}
                  onChange={(e) => setDados((prev) => ({ ...prev, nomeFantasia: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                  <Input
                    id="inscricaoEstadual"
                    placeholder="Digite a inscrição estadual"
                    value={dados.inscricaoEstadual}
                    onChange={(e) => setDados((prev) => ({ ...prev, inscricaoEstadual: e.target.value }))}
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="inscricaoMunicipal">Inscrição Municipal</Label>
                  <Input
                    id="inscricaoMunicipal"
                    placeholder="Digite a inscrição municipal"
                    value={dados.inscricaoMunicipal}
                    onChange={(e) => setDados((prev) => ({ ...prev, inscricaoMunicipal: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-lg">
                <MapPin className="h-5 w-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    placeholder="00000-000"
                    value={dados.cep}
                    onChange={(e) => setDados((prev) => ({ ...prev, cep: e.target.value }))}
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="estadoEndereco">Estado (UF) *</Label>
                  <Select
                    value={dados.estadoEndereco}
                    onValueChange={(value) => setDados((prev) => ({ ...prev, estadoEndereco: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosBrasileiros.map((estado) => (
                        <SelectItem key={estado.value} value={estado.value}>
                          {estado.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="rua">Rua *</Label>
                <Input
                  id="rua"
                  placeholder="Digite o endereço completo"
                  value={dados.rua}
                  onChange={(e) => setDados((prev) => ({ ...prev, rua: e.target.value }))}
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  placeholder="Digite a cidade"
                  value={dados.cidade}
                  onChange={(e) => setDados((prev) => ({ ...prev, cidade: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contatos */}
          <Card>
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-lg">
                <Phone className="h-5 w-5" />
                Contatos
                <span className="text-sm text-muted-foreground font-normal">(máximo 3)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <AnimatePresence>
                {dados.contatos.map((contato, index) => (
                  <motion.div
                    key={contato.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-6 border rounded-lg space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Contato {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoverContato(contato.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-4">
                        <Label>Nome do Contato</Label>
                        <Input
                          placeholder="Digite o nome"
                          value={contato.nome}
                          onChange={(e) => handleAtualizarContato(contato.id, "nome", e.target.value)}
                        />
                      </div>
                      <div className="space-y-4">
                        <Label>Tipo</Label>
                        <Select
                          value={contato.tipo}
                          onValueChange={(value) => handleAtualizarContato(contato.id, "tipo", value as unknown as string)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {tiposContato.map((tipo) => (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-4">
                        <Label>{tiposContato.find((t) => t.value === contato.tipo)?.label || "Valor"}</Label>
                        <Input
                          placeholder={getPlaceholderPorTipo(contato.tipo)}
                          value={contato.valor}
                          onChange={(e) => handleAtualizarContato(contato.id, "valor", e.target.value)}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {dados.contatos.length < 3 && (
                <Button
                  variant="outline"
                  onClick={handleAdicionarContato}
                  className="w-full border-dashed bg-transparent py-6"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Adicionar Contato
                </Button>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-end pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSalvar} className="sm:w-auto">
              <Save className="h-5 w-5 mr-2" />
              Salvar Fornecedor
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
