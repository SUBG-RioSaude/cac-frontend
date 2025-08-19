import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function UnidadesPageSkeleton() {
  return (
    <div data-testid="unidades-skeleton" className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="text-center sm:text-left">
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>

        {/* Filtros */}
        <div className="space-y-4">
          {/* Barra de pesquisa */}
          <Card className="shadow-sm border-0 bg-card/50 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Skeleton className="h-11 w-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-11 w-20" />
                  <Skeleton className="h-11 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filtros avançados */}
          <Card className="shadow-sm border-0 bg-card/50 backdrop-blur">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex items-end">
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        <Card className="shadow-sm border-0 bg-card/50 backdrop-blur">
          <CardHeader className="pb-4 px-3 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="mx-3 sm:mx-6 mb-3 sm:mb-6">
              {/* Versão mobile - Cards skeleton */}
              <div className="block lg:hidden space-y-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>

                    <div className="space-y-2 mb-3">
                      {Array.from({ length: 5 }, (_, j) => (
                        <div key={j}>
                          <Skeleton className="h-3 w-8 mb-1" />
                          <Skeleton className={`h-4 ${j === 4 ? 'w-full' : 'w-20'}`} />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-end gap-1">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </Card>
                ))}
              </div>

              {/* Versão desktop - Tabela skeleton */}
              <div className="hidden lg:block rounded-lg border bg-background/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">
                        <Skeleton className="h-4 w-4" />
                      </TableHead>
                      <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-12" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-8" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-8" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-12" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                      <TableHead className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 10 }, (_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full max-w-[200px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full max-w-[200px]" /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Paginação skeleton */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-6 pb-3 sm:pb-6">
              <Skeleton className="h-4 w-48" />
              <div className="flex items-center justify-center gap-2">
                <Skeleton className="h-8 w-20" />
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Skeleton key={i} className="h-8 w-8" />
                  ))}
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}