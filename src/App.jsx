import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function App() {
  const [links, setLinks] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [senha, setSenha] = useState('')
  const [form, setForm] = useState({ titulo: '', url: '', imagem: '', bonus: '', principal: false })

  useEffect(() => {
    if (window.location.hash.includes('admin')) setIsAdmin(true)
    buscar()
  }, [])

  async function buscar() {
    const { data } = await supabase.from('links_roleta').select('*').order('created_at', { ascending: false })
    if (data) setLinks(data)
  }

  async function salvar(e) {
    e.preventDefault()
    await supabase.from('links_roleta').insert([{
      titulo: form.titulo.toUpperCase(),
      url: form.url,
      imagem: form.imagem,
      bonus: form.bonus,
      principal: form.principal,
      cliques: 0
    }])
    setForm({ titulo: '', url: '', imagem: '', bonus: '', principal: false })
    buscar()
  }

  async function deletar(id) {
    if (confirm('Deletar?')) {
      await supabase.from('links_roleta').delete().eq('id', id)
      buscar()
    }
  }

  async function abrir(link) {
    await supabase.from('links_roleta').update({ cliques: (link.cliques||0)+1 }).eq('id', link.id)
    window.open(link.url, '_blank')
  }

  const linkPrincipal = links.find(l => l.principal) || links.find(l => l.titulo.includes('FACEBOOK')) || null
  const plataformas = links.filter(l => l.id !== linkPrincipal?.id)

  if (isAdmin && senha !== 'Grazi2024!') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl w-full max-w-sm text-center">
          <h1 className="text-2xl font-black mb-6">ADMIN</h1>
          <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} placeholder="Senha" className="w-full border-2 p-3 rounded-xl mb-4" />
          <button onClick={()=>{}} className="w-full bg-black text-white py-3 rounded-xl font-bold">Entrar</button>
          <p className="text-xs text-gray-400 mt-4">Senha: Grazi2024!</p>
        </div>
      </div>
    )
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center my-4">
            <h1 className="font-black text-xl">ADMIN - Plataformas</h1>
            <a href="/" className="bg-black text-white px-5 py-2 rounded-full text-sm font-bold">Ver Site</a>
          </div>
          <form onSubmit={salvar} className="bg-white p-6 rounded-2xl shadow mb-6 space-y-3">
            <input required placeholder="Nome: 98A.COM ou FACEBOOK" value={form.titulo} onChange={e=>setForm({...form, titulo: e.target.value})} className="w-full border p-3 rounded-xl" />
            <input required placeholder="Link: https://..." value={form.url} onChange={e=>setForm({...form, url: e.target.value})} className="w-full border p-3 rounded-xl" />
            <input required placeholder="Imagem URL" value={form.imagem} onChange={e=>setForm({...form, imagem: e.target.value})} className="w-full border p-3 rounded-xl" />
            <label className="flex gap-2 items-center text-sm font-bold"><input type="checkbox" checked={form.principal} onChange={e=>setForm({...form, principal: e.target.checked})} /> Marcar como LINK PRINCIPAL DO TOPO (ícone redondo)</label>
            <button className="w-full bg-black text-white py-3 rounded-xl font-bold">Salvar</button>
          </form>
          <div className="bg-white rounded-2xl p-4 space-y-2">
            {links.map(l=>(
              <div key={l.id} className="flex items-center gap-3 border p-3 rounded-xl">
                <img src={l.imagem} className={`w-12 h-12 object-cover ${l.principal ? 'rounded-full border-2 border-yellow-400' : 'rounded-lg'}`} />
                <div className="flex-1"><p className="font-bold text-sm">{l.titulo} {l.principal && '⭐ PRINCIPAL'}</p><p className="text-xs text-gray-500">{l.cliques||0} cliques</p></div>
                <button onClick={()=>deletar(l.id)} className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs">Del</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="bg-[#0a0a0a] text-white text-center py-6 px-4">
        <h1 className="text-xl md:text-3xl font-black uppercase">PLATAFORMAS COM BÔNUS DE ROLETA NO CADASTRO</h1>
      </div>

      {linkPrincipal && (
        <div className="max-w-xl mx-auto -mt-2 p-4">
          <div onClick={()=>abrir(linkPrincipal)} className="bg-white rounded-3xl shadow-xl p-6 text-center cursor-pointer hover:scale-105 transition border-2 border-yellow-400">
            <img src={linkPrincipal.imagem} className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-black shadow-lg" />
            <h2 className="font-black text-lg uppercase">{linkPrincipal.titulo}</h2>
            <p className="bg-black text-white mt-3 py-3 rounded-full font-black text-sm">👉 ENTRA NO GRUPO VIP DO FACEBOOK</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {plataformas.map(link=>(
            <div key={link.id} onClick={()=>abrir(link)} className="cursor-pointer group">
              <div className="rounded-2xl overflow-hidden bg-white shadow hover:shadow-xl transition group-hover:-translate-y-1">
                <img src={link.imagem} className="w-full aspect-square object-contain" />
                <div className="bg-black py-2.5 text-center"><p className="text-white font-black text-xs uppercase tracking-widest">{link.titulo}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
