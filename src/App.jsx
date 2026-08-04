import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Pega as variáveis da Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default function App() {
  const [links, setLinks] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    // Mostra admin se tiver #admin na URL
    if (window.location.hash === '#admin') setIsAdmin(true)
    carregarLinks()
  }, [])

  async function carregarLinks() {
    setCarregando(true)
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .order('id', { ascending: true })
    
    if (error) {
      console.log('Erro Supabase:', error)
    }
    if (data) {
      setLinks(data)
    }
    setCarregando(false)
  }

  async function handleClick(link) {
    // Soma 1 clique no banco
    await supabase
      .from('links')
      .update({ cliques: (link.cliques || 0) + 1 })
      .eq('id', link.id)
    
    // Abre o link
    window.open(link.url, '_blank')
    
    // Atualiza a tela
    carregarLinks()
  }

  const totalCliques = links.reduce((acc, l) => acc + (l.cliques || 0), 0)

  if (carregando) {
    return <div style={{ padding: 20, fontFamily: 'Arial' }}>Carregando...</div>
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial', maxWidth: 800, margin: '0 auto' }}>
      {isAdmin && (
        <div style={{ 
          background: '#ff0', 
          padding: 15, 
          marginBottom: 20, 
          fontWeight: 'bold', 
          textAlign: 'center',
          border: '2px solid #000',
          borderRadius: 8
        }}>
          ADMIN - {links.length} links
          <div style={{ fontSize: 24, marginTop: 5 }}>[TOTAL: {totalCliques} CLIQUES]</div>
        </div>
      )}

      <h1 style={{ textAlign: 'center' }}>PLATAFORMAS COM BÔNUS DE ROLETA NO CADASTRO</h1>
      
      {links.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666' }}>
          {isAdmin ? 'Nenhum link cadastrado no Supabase ainda.' : 'Carregando plataformas...'}
        </p>
      )}

      {links.map(link => (
        <div key={link.id} style={{ 
          border: '1px solid #ccc', 
          padding: 15, 
          marginBottom: 15, 
          borderRadius: 8,
          background: '#f9f9f9'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>{link.titulo}</h3>
          <p style={{ margin: '5px 0' }}><strong>Bônus:</strong> {link.bonus}</p>
          {isAdmin && <p style={{ margin: '5px 0', color: 'blue' }}><strong>Cliques:</strong> {link.cliques || 0}</p>}
          <button 
            onClick={() => handleClick(link)} 
            style={{ 
              background: 'green', 
              color: 'white', 
              padding: '12px 25px', 
              border: 'none', 
              borderRadius: 5, 
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 'bold',
              marginTop: 10
            }}
          >
            ACESSAR PLATAFORMA
          </button>
        </div>
      ))}
    </div>
  )
}