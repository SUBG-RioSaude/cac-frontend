import { Toaster } from 'sonner'

import { AppSidebar } from '@/components/app-sidebar'
import { ErrorBoundary } from '@/components/error-boundary'
import { NotificacoesDropdown } from '@/components/notificacoes-dropdown'
import PageBreadcrumb from '@/components/page-breadcrumb'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

interface LayoutAuthenticatedProps {
  children: React.ReactNode
}

export const LayoutAuthenticated = ({ children }: LayoutAuthenticatedProps) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header fixo - nunca sai da tela */}
        <header className="flex-shrink-0 border-b border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <PageBreadcrumb />
            <NotificacoesDropdown />
          </div>
        </header>

        {/* Conteúdo principal com scroll */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <ErrorBoundary>
            <div className="mx-auto px-6">{children}</div>
          </ErrorBoundary>
        </main>

        <Toaster position="bottom-right" richColors closeButton />
      </SidebarInset>
    </SidebarProvider>
  )
}
