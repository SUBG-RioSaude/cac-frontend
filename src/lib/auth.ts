// src/lib/auth.ts
export function getToken(): string | null {
  // Caso o token venha como HttpOnly, não tem como acessar via JS.
  // Esse boilerplate serve apenas como fallback se no futuro 
  // o time decidir expor o token em cookies acessíveis ou localStorage.
  
  // Exemplo com localStorage (temporário)
  return localStorage.getItem("token");

  // Ou exemplo com cookie "não HttpOnly"
  // return document.cookie
  //   .split("; ")
  //   .find(row => row.startsWith("jwt="))
  //  ?.split("=")[1] ?? null;
}
