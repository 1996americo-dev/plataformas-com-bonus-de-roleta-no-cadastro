import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function App() {
  const [links, setLinks] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [senha, setSenha] = useState('')
  const [form, setForm] = useState({ titulo: '', url: '', imagem: '', bonus: '' })

  useEffect(() => {
    if (window.location.hash.includes('admin')) setIsAdmin(true)
    buscarLinks()
  }, [])

  async function buscarLinks() {
    const { data } = await supabase.from('links_roleta').select('*').order('created_at', { ascending: false })
    if (data) setLinks(data)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { error } = await supabase.from('links_roleta').insert([{
      titulo: form.titulo.toUpperCase(),
      url: form.url,
      imagem: form.imagem,
      bonus: form.bonus,
      cliques: 0
    }])
    if (!error) {
      setForm({ titulo: '', url: '', imagem: '', bonus: '' })
      buscarLinks()
      alert('Adicionado com sucesso!')
    }
  }

  async function deletar(id) {
    if (confirm('Tem certeza que quer deletar?')) {
      await supabase.from('links_roleta').delete().eq('id', id)
      buscarLinks()
    }
  }

  async function abrirLink(link) {
    await supabase.from('links_roleta').update({ cliques: (link.cliques || 0) + 1 }).eq('id', link.id)
    window.open(link.url, '_blank')
  }

  // TELA DE SENHA ADMIN
  if (isAdmin && senha!== 'Grazi2024!') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
          <h1 className="text-2xl font-black mb-2">ADMIN</h1>
          <p className="text-sm text-gray-500 mb-6">Digite a senha para entrar</p>
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full border-2 border-gray-200 p-3 rounded-xl mb-4 focus:border-black outline-none"
          />
          <button onClick={() => senha === '' && alert('Digite a senha')} className="w-full bg-black text-white py-3 rounded-xl font-bold">
            Entrar
          </button>
        </div>
      </div>
    )
  }

  // PAINEL ADMIN BONITO
  if (isAdmin && senha === 'Grazi2024!') {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6 pt-4">
            <h1 className="text-2xl font-black">PAINEL ADMIN</h1>
            <a href="/" className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold">Ver Site</a>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="font-bold mb-4">Adicionar Nova Plataforma</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Nome: 98A.COM" value={form.titulo} onChange={e=>setForm({...form, titulo: e.target.value})} className="w-full border p-3 rounded-xl" />
              <input required placeholder="Link de afiliado: https://..." value={form.url} onChange={e=>setForm({...form, url: e.target.value})} className="w-full border p-3 rounded-xl" />
              <input required placeholder="URL da Imagem 512x512" value={form.imagem} onChange={e=>setForm({...form, imagem: e.target.value})} className="w-full border p-3 rounded-xl" />
              <input placeholder="Bônus: 5-88 (opcional)" value={form.bonus} onChange={e=>setForm({...form, bonus: e.target.value})} className="w-full border p-3 rounded-xl" />
              <button className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800">SALVAR PLATAFORMA</button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="font-bold mb-4">Plataformas: {links.length}</h2>
            <div className="grid gap-3">
              {links.map(link=>(
                <div key={link.id} className="flex gap-3 items-center border p-3 rounded-xl">
                  <img src={link.imagem} className="w-16 h-16 object-contain bg-gray-50 rounded-lg" />
                  <div className="flex-1">
                    <p className="font-black">{link.titulo}</p>
                    <p className="text-xs text-gray-500">{link.cliques || 0} cliques</p>
                  </div>
                  <button onClick={()=>deletar(link.id)} className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-bold">Excluir</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // SITE PRINCIPAL BONITO
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="bg-[#0a0a0a] text-white py-8 px-4 text-center sticky top-0 z-10">
        <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight">
          PLATAFORMAS COM BÔNUS DE ROLETA NO CADASTRO
        </h1>
      </div>

      <div className="max-w-7xl mx-auto p-3 md:p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {links.map(link=>(
            <div key={link.id} onClick={()=>abrirLink(link)} className="cursor-pointer group">
              <div className="rounded-2xl overflow-hidden bg-white shadow-sm group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1">
                <div className="bg-white">
                  <img src={link.imagem} alt={link.titulo} className="w-full aspect-square object-contain" />
                </div>
                <div className="bg-black py-3 text-center">
                  <p className="text-white font-black text- md:text-sm uppercase tracking-widest">{link.titulo}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
