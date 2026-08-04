import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default function App() {
  const [links, setLinks] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (window.location.hash === '#admin') setIsAdmin(true)
    carregarLinks()
  }, [])

  async function carregarLinks() {
    const { data } = await supabase.from('links_roleta').select('*').order('id', { ascending: true })
    if (data) setLinks(data)
  }

  async function handleClick(link) {
    await supabase.from('links_roleta').update({ cliques: (link.cliques || 0) + 1 }).eq('id', link.id)
    window.open(link.url, '_blank')
    carregarLinks()
  }

  const totalCliques = links.reduce((acc, l) => acc + (l.cliques || 0), 0)

  return (
    <div style={{ padding: 20, fontFamily: 'Arial', maxWidth: 800, margin: '0 auto' }}>
      {isAdmin && (
        <div style={{ background: '#FFEB3B', padding: 15, textAlign: 'center', fontWeight: 'bold', borderRadius: 8, marginBottom: 20, border: '2px solid black' }}>
          ADMIN - {links.length} links
          <div style={{ fontSize: 24, marginTop: 5 }}>[TOTAL: {totalCliques} CLIQUES]</div>
        </div>
      )}
      <h1 style={{ textAlign: 'center' }}>PLATAFORMAS COM BÔNUS DE ROLETA NO CADASTRO</h1>
      {links.map(link => (
        <div key={link.id} style={{ border: '1px solid #ccc', padding: 15, marginBottom: 10, borderRadius: 8 }}>
          <h3>{link.titulo || link.nome}</h3>
          <p>{link.bonus || link.descricao}</p>
          {isAdmin && <p style={{ color: 'blue' }}>Cliques: {link.cliques || 0}</p>}
          <button onClick={() => handleClick(link)} style={{ background: 'green', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 5, cursor: 'pointer', fontWeight: 'bold' }}>
            ACESSAR PLATAFORMA
          </button>
        </div>
      ))}
    </div>
  )
}