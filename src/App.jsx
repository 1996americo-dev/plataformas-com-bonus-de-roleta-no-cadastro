import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://wbbzozjgfjvukqgdxqjk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2YnpvempnZmp2dWtxZ2R4cWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjI0MzAsImV4cCI6MjA2OTM5ODQzMH0.LcE5Z5_3u4M6J7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z'
)

const SENHA_ADMIN = '123456'

export default function App() {
  const [links, setLinks] = useState([])
  const [totalCliques, setTotalCliques] = useState(0)
  const [senha, setSenha] = useState('')
  const [logado, setLogado] = useState(false)
  const [form, setForm] = useState({ categoria: 'plataforma', titulo: '', url: '', imagem: '' })
  const [preview, setPreview] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (window.location.hash === '#admin') setIsAdmin(true)
    carregarLinks()
  }, [])

  async function carregarLinks() {
    const { data } = await supabase.from('links_roleta').select('*').order('id', { ascending: true })
    if (data) {
      setLinks(data)
      const total = data.reduce((acc, item) => acc + (item.cliques || 0), 0)
      setTotalCliques(total)
    }
  }

  async function handleClick(link) {
    await supabase.from('links_roleta').update({ cliques: (link.cliques || 0) + 1 }).eq('id', link.id)
    setTotalCliques(t => t + 1)
    window.open(link.url, '_blank')
  }

  async function handleImagem(e) {
    const file = e.target.files[0]
    if (!file) return
    const fileName = Date.now() + '-' + file.name
    await supabase.storage.from('imagens').upload(fileName, file)
    const { data } = supabase.storage.from('imagens').getPublicUrl(fileName)
    setForm({ ...form, imagem: data.publicUrl })
    setPreview(data.publicUrl)
  }

  async function salvarLink() {
    if (!form.titulo || !form.url) return alert('Preencha titulo e URL')
    await supabase.from('links_roleta').insert([{ ...form, cliques: 0 }])
    setForm({ categoria: 'plataforma', titulo: '', url: '', imagem: '' })
    setPreview('')
    carregarLinks()
  }

  async function deletarLink(id) {
    await supabase.from('links_roleta').delete().eq('id', id)
    carregarLinks()
  }

  if (isAdmin && !logado) {
    return (
      <div style={{ background: '#151515', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#151515', padding: 24, borderRadius: 12, border: '1px solid #222' }}>
          <h2 style={{ color: '#fff' }}>ADMIN</h2>
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Senha" style={{ padding: 8, width: '100%', marginBottom: 8 }} />
          <button onClick={() => { if (senha === SENHA_ADMIN) setLogado(true); else alert('Senha errada') }} style={{ width: '100%', padding: 10, background: '#fbbf24', fontWeight: 900 }}>ENTRAR</button>
        </div>
      </div>
    )
  }

  if (isAdmin && logado) {
    return (
      <div style={{ maxWidth: 520, margin: '0 auto', padding: 16, color: '#fff', fontFamily: 'system-ui' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 14, margin: 0 }}>ADMIN - {links.length} links</h2>
          <span style={{ background: '#fbbf24', color: '#000', padding: '4px 10px', borderRadius: 99, fontWeight: 900, fontSize: 12 }}>TOTAL: {totalCliques} CLIQUES</span>
        </div>
        <div style={{ background: '#151515', padding: 12, borderRadius: 12, border: '1px solid #222' }}>
          <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} style={{ width: '100%', marginBottom: 8, padding: 8 }}>
            <option value="plataforma">Plataforma (grade 4x4)</option>
            <option value="principal">PRINCIPAL (topo azul)</option>
          </select>
          <input placeholder="Titulo: ex: ENTRAR NO GRUPO VIP" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
          <input placeholder="URL https://..." value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
          <div style={{ border: '1px dashed #333', padding: 8, borderRadius: 8, background: '#000' }}>
            <input type="file" accept="image/*" onChange={handleImagem} style={{ color: '#fff', fontSize: 11 }} />
            {preview && <img src={preview} style={{ width: 100, marginTop: 10, borderRadius: 8, aspectRatio: '1/1', objectFit: 'cover' }} />}
          </div>
          <button onClick={salvarLink} style={{ width: '100%', marginTop: 10, padding: 12, background: '#fbbf24', color: '#000', fontWeight: 900, border: 'none', borderRadius: 8 }}>SALVAR LINK</button>
        </div>
        <div style={{ marginTop: 16 }}>
          {links.map(l => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#222', padding: 8, borderRadius: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 12 }}>{l.titulo} - {l.cliques || 0} cliques</span>
              <button onClick={() => deletarLink(l.id)} style={{ background: 'red', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4 }}>X</button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: 16 }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        {links.filter(l => l.categoria === 'principal').map(l => (
          <div key={l.id} onClick={() => handleClick(l)} style={{ background: '#3b82f6', padding: 14, borderRadius: 12, textAlign: 'center', color: '#fff', fontWeight: 900, marginBottom: 12, cursor: 'pointer' }}>{l.titulo}</div>
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {links.filter(l => l.categoria === 'plataforma').map(l => (
            <div key={l.id} onClick={() => handleClick(l)} style={{ background: '#151515', borderRadius: 12, padding: 8, cursor: 'pointer', border: '1px solid #222' }}>
              {l.imagem && <img src={l.imagem} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 8 }} />}
              <div style={{ color: '#fff', fontSize: 12, marginTop: 6, textAlign: 'center', fontWeight: 700 }}>{l.titulo}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
