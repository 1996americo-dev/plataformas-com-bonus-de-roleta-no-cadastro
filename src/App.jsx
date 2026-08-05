import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function App() {
  const [links, setLinks] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [senha, setSenha] = useState('')
  const [form, setForm] = useState({ titulo: '', url: '', imagem: '' })

  useEffect(() => {
    if (window.location.hash === '#admin') setIsAdmin(true)
    buscar()
  }, [])

  async function buscar() {
    const { data } = await supabase.from('links_roleta').select('*').order('id', { ascending: false })
    if (data) setLinks(data)
  }

  async function salvar(e) {
    e.preventDefault()
    await supabase.from('links_roleta').insert([{ 
      titulo: form.titulo.toUpperCase(), 
      url: form.url, 
      imagem: form.imagem, 
      cliques: 0 
    }])
    setForm({ titulo: '', url: '', imagem: '' })
    buscar()
  }

  async function del(id) {
    if (confirm('Excluir?')) {
      await supabase.from('links_roleta').delete().eq('id', id)
      buscar()
    }
  }

  async function abrir(link) {
    await supabase.from('links_roleta').update({ cliques: (link.cliques || 0) + 1 }).eq('id', link.id)
    window.open(link.url, '_blank')
  }

  if (isAdmin && senha !== 'Grazi2024!') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl max-w-sm w-full mx-4">
          <h1 className="text-2xl font-black text-center mb-6">ADMIN</h1>
          <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} placeholder="Senha" className="w-full border p-3 rounded-xl mb-4" />
        </div>
      </div>
    )
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center my-6">
            <h1 className="font-black text-2xl">Admin</h1>
            <a href="/" className="bg-black text-white px-4 py-2 rounded-full text-sm">Ver Site</a>
          </div>
          <form onSubmit={salvar} className="bg-white p-6 rounded-2xl shadow mb-6 space-y-3">
            <input required placeholder="Nome: 98A.COM" value={form.titulo} onChange={e=>setForm({...form, titulo:e.target.value})} className="w-full border p-3 rounded-xl" />
            <input required placeholder="Link" value={form.url} onChange={e=>setForm({...form, url:e.target.value})} className="w-full border p-3 rounded-xl" />
            <input required placeholder="Imagem URL" value={form.imagem} onChange={e=>setForm({...form, imagem:e.target.value})} className="w-full border p-3 rounded-xl" />
            <button className="w-full bg-black text-white py-3 rounded-xl font-bold">Salvar</button>
          </form>
          <div className="space-y-2">
            {links.map(l=>(
              <div key={l.id} className="bg-white p-3 rounded-xl flex gap-3 items-center">
                <img src={l.imagem} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1"><p className="font-bold text-sm">{l.titulo}</p></div>
                <button onClick={()=>del(l.id)} className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs">X</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-center">
      <h1 className="pt-8 px-4 text-2xl md:text-4xl font-black uppercase">
        PLATAFORMAS COM BÔNUS DE ROLETA NO CADASTRO
      </h1>
      
      {/* ÍCONE REDONDO NO MEIO */}
      <img 
        src="https://i.imgur.com/8Qm7Q8p.png" 
        className="w-28 h-28 rounded-full mx-auto my-8 border-4 border-black shadow-xl object-cover" 
        alt="Logo"
      />
      
      {/* LINK PRINCIPAL NO TOPO */}
      <a 
        href="https://www.facebook.com/share/g/1EKJ8WqU9d/" 
        target="_blank"
        className="inline-block bg-black text-white px-10 py-4 rounded-full font-black text-base hover:scale-105 transition mb-10"
      >
        ENTRAR NO GRUPO VIP DO FACEBOOK
      </a>

      {/* PLATAFORMAS EMBAIXO */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {links.map(link=>(
            <div key={link.id} onClick={()=>abrir(link)} className="cursor-pointer">
              <div className="rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition border">
                <img src={link.imagem} className="w-full aspect-square object-contain p-2" />
                <div className="bg-black py-3">
                  <p className="text-white font-black text-sm uppercase">{link.titulo}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
