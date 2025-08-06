import { useParams } from 'react-router-dom'

function FornecedorDetailPage() {
  const { fornecedorId } = useParams<{ fornecedorId: string }>()

  return <div>Hello "/fornecedores/{fornecedorId}"!</div>
}

export default FornecedorDetailPage
