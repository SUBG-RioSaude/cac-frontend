import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export const AparenciaSection = () => {
  const { theme, setTheme } = useTheme()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="size-5" />
          Aparência
        </CardTitle>
        <CardDescription>
          Personalize a aparência do sistema de acordo com sua preferência
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={theme ?? 'system'}
          onValueChange={setTheme}
          className="space-y-3"
        >
          {/* Light Mode */}
          <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-900">
            <RadioGroupItem value="light" id="theme-light" />
            <Label
              htmlFor="theme-light"
              className="flex flex-1 cursor-pointer items-center gap-3"
            >
              <Sun className="size-5 text-yellow-500" />
              <div className="flex flex-col">
                <span className="font-medium">Modo Claro</span>
                <span className="text-sm text-gray-500">
                  Interface clara e brilhante
                </span>
              </div>
            </Label>
          </div>

          {/* Dark Mode */}
          <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-900">
            <RadioGroupItem value="dark" id="theme-dark" />
            <Label
              htmlFor="theme-dark"
              className="flex flex-1 cursor-pointer items-center gap-3"
            >
              <Moon className="size-5 text-blue-500" />
              <div className="flex-col flex">
                <span className="font-medium">Modo Escuro</span>
                <span className="text-sm text-gray-500">
                  Interface escura para reduzir cansaço visual
                </span>
              </div>
            </Label>
          </div>

          {/* System Mode */}
          <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-900">
            <RadioGroupItem value="system" id="theme-system" />
            <Label
              htmlFor="theme-system"
              className="flex flex-1 cursor-pointer items-center gap-3"
            >
              <Monitor className="size-5 text-gray-500" />
              <div className="flex flex-col">
                <span className="font-medium">Automático</span>
                <span className="text-sm text-gray-500">
                  Acompanha as configurações do sistema operacional
                </span>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
