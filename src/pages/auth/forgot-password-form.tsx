"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Mail, Send, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/lib/auth/auth-store"

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [sucesso, setSucesso] = useState("")
  const [campoFocado, setCampoFocado] = useState<string | null>(null)
  const navigate = useNavigate()

  const { 
    esqueciSenha, 
    carregando, 
    erro, 
    limparErro,
    estaAutenticado 
  } = useAuthStore()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validarEmail(email)) {
      return
    }

    limparErro()
    setSucesso("")

    try {
      // Executa esqueci senha
      const sucesso = await esqueciSenha(email)
      
      if (sucesso) {
        // Armazenar contexto de recuperação para diferenciá-lo do login 2FA
        sessionStorage.setItem('auth_context', 'password_recovery')
        sessionStorage.setItem('auth_email', email)
        
        console.log('Redirecionando para verificação de código...')
        
        // Redirecionar imediatamente para a tela de verificação
        navigate("/auth/verificar-codigo", { replace: true })
      }
    } catch (error) {
      console.error('Erro ao processar esqueci senha:', error)
    }
  }


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
      {/* Left side - Background Image */}
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

      {/* Right side - Forgot Password Form */}
      <motion.div
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <motion.div className="text-center">
            <motion.div
              className="flex items-center justify-center space-x-2 mb-8"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <img 
                src="/logo certa.png" 
                alt="Logo CAC" 
                className="w-16 h-16 object-contain"
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <motion.div
                  className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4"
                  animate="pulse"
                >
                  <Mail className="w-8 h-8 text-blue-600" />
                </motion.div>
                <motion.h1 className="text-2xl font-bold text-gray-900">
                  Esqueceu sua senha?
                </motion.h1>
                <motion.p className="text-gray-600 text-sm">
                  Digite seu e-mail e enviaremos instruções
                  <br />
                  para redefinir sua senha
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

                  {sucesso && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert className="border-green-200 bg-green-50">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
                          <Check className="h-4 w-4 text-green-600" />
                        </motion.div>
                        <AlertDescription className="text-green-800">{sucesso}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                      <motion.div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <motion.div
                          variants={inputVariants}
                          animate={campoFocado === "email" ? "focused" : "unfocused"}
                        >
                          <Input
                            id="email"
                            type="email"
                            placeholder="Digite seu e-mail cadastrado"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setCampoFocado("email")}
                            onBlur={() => setCampoFocado(null)}
                            required
                            className="h-12 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </motion.div>
                      </motion.div>

                      <motion.div>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.1 }}
                        >
                          <Button
                            type="submit"
                            className="w-full h-12 bg-[#008BA7] hover:bg-[#008BA7]/80 transition-all duration-300 relative overflow-hidden"
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
                                  Enviando...
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="send"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="flex items-center"
                                >
                                  <Send className="mr-2 h-4 w-4" />
                                  Enviar Instruções
                                </motion.div>
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

                <motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/login")}
                      className="w-full hover:bg-gray-100 transition-all duration-200"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar ao Login
                    </Button>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
