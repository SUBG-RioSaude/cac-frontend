import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/lib/auth/auth-store"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [campoFocado, setCampoFocado] = useState<string | null>(null)
  const navigate = useNavigate()

  const { login, carregando, erro, limparErro, estaAutenticado } =
    useAuthStore()


  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (estaAutenticado) {
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/'
      sessionStorage.removeItem('redirectAfterLogin')
      navigate(redirectPath, { replace: true })
    }
  }, [estaAutenticado, navigate])

  const validarEmail = (email: string): boolean => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regexEmail.test(email)
  }

  const validarSenha = (senha: string): boolean => {
    return senha.length >= 6
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    limparErro()

    // Validação local
    if (!validarEmail(email)) {
      return
    }

    if (!validarSenha(senha)) {
      return
    }

    // Executa login
    const sucesso = await login(email, senha)
    
    if (sucesso) {
      // Redireciona para verificação 2FA
      navigate("/auth/verificar-codigo", { replace: true })
    }
  }

  // const handleSubmit = (e: React.FormEvent) => {
  //   void handleSubmitAsync(e)
  // }


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  }

  const inputVariants = {
    focused: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
    unfocused: {
      scale: 1,
      transition: { duration: 0.2 },
    },
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left side - Background Image with parallax effect */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-transparent z-10" />
        <img 
          src="/gestao.svg" 
          alt="Background de gestão" 
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Floating elements animation */}
        <motion.div
          className="absolute top-20 left-20 w-4 h-4 bg-white/20 rounded-full"
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-32 left-32 w-6 h-6 bg-white/15 rounded-full"
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </motion.div>

      {/* Right side - Login Form */}
      <motion.div
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full max-w-md space-y-8">
          {/* Logo with animation */}
          <motion.div className="text-center">
            <motion.div
              className="flex items-center justify-center space-x-2 mb-8"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <img 
                src="/logo.png" 
                alt="Logo CAC" 
                className="object-contain"
              />
            </motion.div>
          </motion.div>

          <motion.div>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <motion.h1 className="text-2xl font-bold text-gray-900">
                  Bem-Vindo(a)!
                </motion.h1>
                <motion.p className="text-gray-600 text-sm">
                  Insira suas credenciais
                </motion.p>
              </CardHeader>

              <CardContent className="space-y-6">
                <AnimatePresence mode="wait">
                  {erro && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert variant="destructive" className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-800 leading-relaxed break-words">
                          {erro}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.form onSubmit={handleSubmit} className="space-y-4">
                  <motion.div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <motion.div variants={inputVariants} animate={campoFocado === "email" ? "focused" : "unfocused"}>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Digite seu e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setCampoFocado("email")}
                        onBlur={() => setCampoFocado(null)}
                        required
                        className="h-12 transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </motion.div>
                  </motion.div>

                  <motion.div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="senha">Senha</Label>
                      <motion.button
                        type="button"
                        className="cursor-pointer text-sm text-blue-600 hover:underline transition-colors duration-200"
                        onClick={() => navigate("/auth/esqueci-senha")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Esqueceu a senha?
                      </motion.button>
                    </div>
                    <motion.div
                      className="relative"
                      variants={inputVariants}
                      animate={campoFocado === "senha" ? "focused" : "unfocused"}
                    >
                      <Input
                        id="senha"
                        type={mostrarSenha ? "text" : "password"}
                        placeholder="••••••••"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        onFocus={() => setCampoFocado("senha")}
                        onBlur={() => setCampoFocado(null)}
                        required
                        className="h-12 pr-10 transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <motion.button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setMostrarSenha(!mostrarSenha)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.1 }}
                      >
                        <motion.div animate={{ rotate: mostrarSenha ? 180 : 0 }} transition={{ duration: 0.3 }}>
                          {mostrarSenha ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </motion.div>
                      </motion.button>
                    </motion.div>
                  </motion.div>

                  <motion.div>
                    <motion.div variants={buttonVariants} initial="idle" whileHover="hover" whileTap="tap">
                      <Button
                        type="submit"
                        className="cursor-pointer w-full h-12 bg-[#008BA7] hover:bg-[#008BA7]/80 transition-all duration-300 relative overflow-hidden"
                        disabled={carregando}
                      >
                        <AnimatePresence mode="wait">
                          {carregando ? (
                            <motion.div
                              key="loading"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center"
                            >
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Entrando...
                            </motion.div>
                          ) : (
                            <motion.span
                              key="enter"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              Entrar
                            </motion.span>
                          )}
                        </AnimatePresence>

                        {/* Ripple effect */}
                        <motion.div
                          className="absolute inset-0 bg-white/20 rounded-md"
                          initial={{ scale: 0, opacity: 0 }}
                          whileTap={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
