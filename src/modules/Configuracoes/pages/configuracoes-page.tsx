import { Settings } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AparenciaSection } from '../components/aparencia-section'
import { NotificacoesSection } from '../components/notificacoes-section'
import { PatchNotesSection } from '../components/patch-notes-section'
import { SegurancaSection } from '../components/seguranca-section'

const ConfiguracoesPage = () => {
  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="size-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Personalize sua experiência no sistema
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="aparencia" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="atualizacoes">Atualizações</TabsTrigger>
        </TabsList>

        <TabsContent value="aparencia" className="space-y-4">
          <AparenciaSection />
        </TabsContent>

        <TabsContent value="seguranca" className="space-y-4">
          <SegurancaSection />
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-4">
          <NotificacoesSection />
        </TabsContent>

        <TabsContent value="atualizacoes" className="space-y-4">
          <PatchNotesSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ConfiguracoesPage
