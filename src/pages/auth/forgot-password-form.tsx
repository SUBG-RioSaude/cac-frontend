"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Mail, Send, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")
  const [emailEnviado, setEmailEnviado] = useState(false)
  const [campoFocado, setCampoFocado] = useState<string | null>(null)
  const navigate = useNavigate()

  const validarEmail = (email: string): boolean => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regexEmail.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validarEmail(email)) {
      setErro("E-mail inválido")
      return
    }

    setCarregando(true)
    setErro("")
    setSucesso("")

    // Simular processo de envio de e-mail
    setTimeout(() => {
      setCarregando(false)
      setSucesso("Instruções de recuperação enviadas para seu e-mail!")
      setEmailEnviado(true)

      // Armazena o email para possível uso posterior
      sessionStorage.setItem("recovery_email", email)
    }, 1500)
  }

  const handleResendEmail = async () => {
    setCarregando(true)
    setErro("")

    // Simular reenvio de e-mail
    setTimeout(() => {
      setCarregando(false)
      setSucesso("E-mail reenviado com sucesso!")
    }, 1000)
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
                <AnimatePresence mode="wait">
                  {!emailEnviado ? (
                    <motion.div key="forgot">
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
                    </motion.div>
                  ) : (
                    <motion.div key="success" initial="hidden" animate="visible">
                      <motion.div
                        className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5, repeat: 2 }}
                      >
                        <Check className="w-8 h-8 text-green-600" />
                      </motion.div>
                      <motion.h1 className="text-2xl font-bold text-gray-900">E-mail Enviado!</motion.h1>
                      <motion.p className="text-gray-600 text-sm">
                        Verifique sua caixa de entrada em
                        <br />
                        <span className="font-medium text-gray-900">{email}</span>
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                        <motion.div initial={{ x: -10 }} animate={{ x: 0 }} transition={{ duration: 0.2 }}>
                          <AlertDescription className="text-red-800">{erro}</AlertDescription>
                        </motion.div>
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

                <AnimatePresence mode="wait">
                  {!emailEnviado ? (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-4"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
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
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                  >
                                    <Loader2 className="mr-2 h-4 w-4" />
                                  </motion.div>
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
                  ) : (
                    <motion.div
                      key="success-actions"
                      className="space-y-4"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      <motion.div className="text-center space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="text-left">
                              <p className="text-sm font-medium text-blue-900">Verifique sua caixa de entrada</p>
                              <p className="text-xs text-blue-700 mt-1">
                                Se não encontrar o e-mail, verifique também a pasta de spam ou lixo eletrônico.
                              </p>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600">Não recebeu o e-mail?</p>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="outline"
                            onClick={handleResendEmail}
                            disabled={carregando}
                            className="w-full bg-transparent hover:bg-gray-50 transition-all duration-200"
                          >
                            {carregando ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Reenviando...
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                Reenviar E-mail
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

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
