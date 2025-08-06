import { useParams } from 'react-router-dom'

function ContratoDetailPage() {
  const { contratoId } = useParams<{ contratoId: string }>()

  return <div>Hello "/contratos/{contratoId}"!</div>
}

export default ContratoDetailPage
