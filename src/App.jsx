import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export default function App() {
  const [links, setLinks] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (window.location.hash === '#admin') setIsAdmin(true)
    carregarLinks()
  }, [])

  async function carregarLinks() {
    const { data } = await supabase.from('links').select('*').order('id', { ascending: true })
    if (data) setLinks(data)
  }

  async function handleClick(link) {
    await supabase.from('links').update({ cliques: (link.cliques || 0) + 1 }).eq('id', link.id)
    window.open(link.url, '_blank')
    carregarLinks()
  }

  const totalCliques = links.reduce((acc, l) => acc + (l.cliques || 0), 0)

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      {isAdmin && (
        <div style={{ background: '#ff0', padding: 10, marginBottom: 20, fontWeight: 'bold', textAlign: 'center' }}>
          ADMIN - {links.length} links
          <div style={{ fontSize: 22, marginTop: 5 }}>[TOTAL: {totalCliques} CLIQUES]</div>
        </div>
      )}

      <h1>PLATAFORMAS COM BÔNUS DE ROLETA NO CADASTRO</h1>
      
      {links.map(link => (
        <div key={link.id} style={{ border: '1px solid #ccc', padding: 15, marginBottom: 10, borderRadius: 8 }}>
          <h3>{link.titulo}</h3>
          <p>Bônus: {link.bonus}</p>
          {isAdmin && <p>Cliques: {link.cliques || 0}</p>}
          <button onClick={() => handleClick(link)} style={{ background: 'green', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
            ACESSAR PLATAFORMA
          </button>
        </div>
      ))}
    </div>
  )
}