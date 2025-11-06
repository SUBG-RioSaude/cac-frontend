import { motion } from 'framer-motion'
import { ArrowLeft, Building2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cnpjUtils } from '@/lib/utils'

interface FornecedorHeaderProps {
  razaoSocial: string
  cnpj: string
  status: string
}

export const FornecedorHeader = ({
  razaoSocial,
  cnpj,
  status,
}: FornecedorHeaderProps) => {
  return (
    <motion.div
      className="bg-card rounded-lg border p-6 shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.history.back()}
            className="hover:bg-background/80 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-start gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Building2 className="text-primary h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {razaoSocial}
              </h1>
              <p className="text-muted-foreground mt-1 font-mono text-sm">
                {cnpjUtils.formatar(cnpj)}
              </p>
            </div>
          </div>
        </div>

        <div className="ml-12 sm:ml-0">
          <Badge
            className={
              status === 'Ativo'
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }
          >
            {status}
          </Badge>
        </div>
      </div>
    </motion.div>
  )
}
