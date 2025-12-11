/**
 * ==========================================
 * TABS CUSTOMIZADAS COM CORES CAC
 * ==========================================
 * Componente de Tabs estilizado com as cores da marca CAC
 */

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'

function TabsCAC({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

function TabsListCAC({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex h-12 w-fit items-center justify-center rounded-lg bg-slate-100 p-1 shadow-inner',
        className,
      )}
      {...props}
    />
  )
}

function TabsTriggerCAC({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-transparent px-4 py-2 text-sm font-medium transition-all duration-200',
        'text-slate-600 hover:text-[#2a688f]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42b9eb] focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'data-[state=active]:bg-white data-[state=active]:text-[#2a688f] data-[state=active]:shadow-md data-[state=active]:border-[#42b9eb]',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        className,
      )}
      {...props}
    />
  )
}

function TabsContentCAC({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export { TabsCAC, TabsListCAC, TabsTriggerCAC, TabsContentCAC }
