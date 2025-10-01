import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const UnidadesPageSkeleton = () => {
  return (
    <div
      data-testid="unidades-skeleton"
      className="from-background to-muted/20 min-h-screen bg-gradient-to-br p-6"
    >
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Cabeçalho */}
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div className="text-center sm:text-left">
            <Skeleton className="mb-2 h-8 w-32" />
            <Skeleton className="h-5 w-80" />
          </div>
          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>

        {/* Filtros */}
        <div className="space-y-4">
          {/* Barra de pesquisa */}
          <Card className="bg-card/50 border-0 shadow-sm backdrop-blur">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row">
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
          <Card className="bg-card/50 border-0 shadow-sm backdrop-blur">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <Card className="bg-card/50 border-0 shadow-sm backdrop-blur">
          <CardHeader className="px-3 pb-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Skeleton className="mb-2 h-6 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="mx-3 mb-3 sm:mx-6 sm:mb-6">
              {/* Versão mobile - Cards skeleton */}
              <div className="block space-y-3 lg:hidden">
                {Array.from({ length: 5 }, (_unusedMobile, mobileCardIndex) => (
                  <Card key={mobileCardIndex} className="p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <div>
                          <Skeleton className="mb-1 h-4 w-32" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>

                    <div className="mb-3 space-y-2">
                      {Array.from(
                        { length: 5 },
                        (_unusedMobileField, fieldIndex) => (
                          <div key={fieldIndex}>
                            <Skeleton className="mb-1 h-3 w-8" />
                            <Skeleton
                              className={`h-4 ${fieldIndex === 4 ? 'w-full' : 'w-20'}`}
                            />
                          </div>
                        ),
                      )}
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
              <div className="bg-background/50 hidden overflow-hidden rounded-lg border lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">
                        <Skeleton className="h-4 w-4" />
                      </TableHead>
                      <TableHead>
                        <Skeleton className="h-4 w-16" />
                      </TableHead>
                      <TableHead>
                        <Skeleton className="h-4 w-12" />
                      </TableHead>
                      <TableHead>
                        <Skeleton className="h-4 w-8" />
                      </TableHead>
                      <TableHead>
                        <Skeleton className="h-4 w-8" />
                      </TableHead>
                      <TableHead>
                        <Skeleton className="h-4 w-12" />
                      </TableHead>
                      <TableHead>
                        <Skeleton className="h-4 w-16" />
                      </TableHead>
                      <TableHead>
                        <Skeleton className="h-4 w-20" />
                      </TableHead>
                      <TableHead>
                        <Skeleton className="h-4 w-24" />
                      </TableHead>
                      <TableHead>
                        <Skeleton className="h-4 w-16" />
                      </TableHead>
                      <TableHead className="text-right">
                        <Skeleton className="ml-auto h-4 w-12" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 10 }, (_unusedRow, rowIndex) => (
                      <TableRow key={rowIndex}>
                        <TableCell>
                          <Skeleton className="h-4 w-4" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-8" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-full max-w-[200px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-full max-w-[200px]" />
                        </TableCell>
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
            <div className="flex flex-col gap-3 px-3 pb-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-6">
              <Skeleton className="h-4 w-48" />
              <div className="flex items-center justify-center gap-2">
                <Skeleton className="h-8 w-20" />
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_unusedPage, pageIndex) => (
                    <Skeleton key={pageIndex} className="h-8 w-8" />
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
