"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Mail, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/lib/auth/auth-store"

export default function VerifyForm() {
  const [codigo, setCodigo] = useState(["", "", "", "", "", ""])
  const [email, setEmail] = useState("")
  const [tempoRestante, setTempoRestante] = useState(300) // 5 minutos = 300 segundos
  const [podeReenviar, setPodeReenviar] = useState(false)
  const [codigoExpirado, setCodigoExpirado] = useState(false)
  const [indiceFocado, setIndiceFocado] = useState<number | null>(null)
  const [contexto, setContexto] = useState<'login' | 'password_recovery'>('login')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const navigate = useNavigate()

  const { 
    confirmarCodigo2FA, 
    carregando, 
    erro, 
    limparErro,
    estaAutenticado 
  } = useAuthStore()

  useEffect(() => {
    const emailArmazenado = sessionStorage.getItem("auth_email")
    const contextoAuth = sessionStorage.getItem("auth_context") as 'login' | 'password_recovery' || 'login'
    
    if (!emailArmazenado) {
      navigate("/login")
      return
    }
    setEmail(emailArmazenado)
    setContexto(contextoAuth)

    // Redireciona se já estiver autenticado
    if (estaAutenticado) {
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/'
      sessionStorage.removeItem('redirectAfterLogin')
      navigate(redirectPath, { replace: true })
      return
    }

    // Limpa timer anterior se existir
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Cria novo timer
    timerRef.current = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          setPodeReenviar(true)
          setCodigoExpirado(true)
          // Para o timer quando chegar a 0
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [navigate, estaAutenticado])

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60)
    const secs = segundos % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1 || codigoExpirado) return

    const novoCodigo = [...codigo]
    novoCodigo[index] = value
    setCodigo(novoCodigo)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Funcionalidade Ctrl+V para colar código automaticamente
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault()
      
      navigator.clipboard.readText().then(text => {
        // Remove espaços e caracteres especiais, mantém apenas números
        const cleanText = text.replace(/\D/g, '')
        
        // Verifica se o texto tem exatamente 6 dígitos
        if (cleanText.length === 6) {
          const novoCodigo = cleanText.split('')
          setCodigo(novoCodigo)
          
          // Foca no último campo após colar
          setTimeout(() => {
            inputRefs.current[5]?.focus()
          }, 0)
        }
      }).catch(() => {
        // Ignora erros silenciosamente (caso não tenha permissão para clipboard)
      })
      
      return
    }

    if (e.key === "Backspace" && !codigo[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const codigoString = codigo.join("")

    if (codigoString.length !== 6 || codigoExpirado) {
      return
    }

    limparErro()

    if (contexto === 'password_recovery') {
      // Fluxo de recuperação de senha - apenas verifica código e vai para redefinir senha
      const sucesso = await confirmarCodigo2FA(email, codigoString)
      
      if (sucesso) {
        // Código válido, navegar para redefinir senha
        sessionStorage.setItem('auth_context', 'password_reset')
        navigate("/auth/trocar-senha", { replace: true })
      }
      // Erros são tratados pelo store
    } else {
      // Fluxo normal de login com 2FA
      const sucesso = await confirmarCodigo2FA(email, codigoString)
      
      if (sucesso) {
        // Login bem-sucedido, redireciona para a página principal
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/'
        sessionStorage.removeItem('redirectAfterLogin')
        navigate(redirectPath, { replace: true })
      }
      // Se não foi sucesso, pode ser que precise trocar senha
      // O store já redirecionará automaticamente se necessário
    }
  }

  const handleResendCode = async () => {
    // Reenvia código através do esqueci senha
    const { esqueciSenha } = useAuthStore.getState()
    
    try {
      await esqueciSenha(email)
      
      // Reinicia o timer e estados
      setTempoRestante(300) // 5 minutos
      setPodeReenviar(false)
      setCodigoExpirado(false)
      setCodigo(["", "", "", "", "", ""])
      
      // Limpa timer anterior e cria novo
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      timerRef.current = setInterval(() => {
        setTempoRestante((prev) => {
          if (prev <= 1) {
            setPodeReenviar(true)
            setCodigoExpirado(true)
            // Para o timer quando chegar a 0
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
    } catch (erro) {
      console.error('Erro ao reenviar código:', erro)
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

  const codeInputVariants = {
    idle: { scale: 1, borderColor: "#e5e7eb" },
    focused: {
      scale: 1.05,
      borderColor: "#14b8a6",
      boxShadow: "0 0 0 3px rgba(20, 184, 166, 0.1)",
    },
    filled: {
      scale: 1,
      borderColor: "#14b8a6",
      backgroundColor: "#f0fdfa",
    },
  }

  return (
    <div className="min-h-screen flex">
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
      </motion.div>

      {/* Right side - Verify Form */}
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
                  className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4"
                  animate="pulse"
                >
                  <Mail className="w-8 h-8 text-teal-600" />
                </motion.div>
                <motion.h1 className="text-2xl font-bold text-gray-900">
                  {contexto === 'password_recovery' ? 'Verificar Código de Recuperação' : 'Verificação de Segurança'}
                </motion.h1>
                <motion.p className="text-gray-600 text-sm">
                  {contexto === 'password_recovery' 
                    ? 'Digite o código de recuperação enviado para'
                    : 'Enviamos um código de 6 dígitos para'
                  }
                  <br />
                  <span className="font-medium">{email}</span>
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

                <motion.form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-center block">Digite o código de verificação</Label>
                    <motion.div className="flex justify-center space-x-2" variants={containerVariants}>
                      {codigo.map((digito, index) => (
                        <motion.div key={index} custom={index}>
                          <motion.div
                            variants={codeInputVariants}
                            animate={indiceFocado === index ? "focused" : digito ? "filled" : "idle"}
                            whileHover={{ scale: codigoExpirado ? 1 : 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Input
                              ref={(el) => {
                                inputRefs.current[index] = el;
                              }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digito}
                              onChange={(e) => handleCodeChange(index, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(index, e)}
                              onFocus={() => setIndiceFocado(index)}
                              onBlur={() => setIndiceFocado(null)}
                              disabled={codigoExpirado}
                              className={`w-12 h-12 text-center text-lg font-bold border-2 transition-all duration-200 ${
                                codigoExpirado ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            />
                          </motion.div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>

                  <motion.div className="text-center text-sm">
                    {tempoRestante > 0 ? (
                      <motion.p
                        className="text-gray-500"
                        animate={{ opacity: tempoRestante < 60 ? [1, 0.5, 1] : 1 }}
                        transition={{ duration: 1, repeat: tempoRestante < 60 ? Number.POSITIVE_INFINITY : 0 }}
                      >
                        Código expira em: <span className="font-medium text-teal-600">{formatarTempo(tempoRestante)}</span>
                      </motion.p>
                    ) : (
                      <motion.p
                        className="text-red-500"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 0.5, repeat: 3 }}
                      >
                        Código expirado - Solicite um novo código
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        className="w-full h-12 bg-[#008BA7] hover:bg-[#008BA7]/80 transition-all duration-300 relative overflow-hidden"
                        disabled={carregando || codigo.join("").length !== 6 || codigoExpirado}
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
                              Verificando...
                            </motion.div>
                          ) : (
                            <motion.div
                              key="verify"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Verificar Código
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.form>

                <motion.div className="text-center space-y-4">
                  <p className="text-sm text-gray-600">Não recebeu o código?</p>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      onClick={handleResendCode}
                      disabled={!podeReenviar || carregando}
                      className="w-full bg-transparent hover:bg-gray-50 transition-all duration-200"
                    >
                      {carregando ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Reenviando...
                        </>
                      ) : (
                        "Reenviar Código"
                      )}
                    </Button>
                  </motion.div>

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
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
