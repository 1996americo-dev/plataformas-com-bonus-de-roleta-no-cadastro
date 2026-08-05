// App.jsx - PLATAFORMAS COM BÔNUS DE ROLETA NO CADASTRO
// REPLACE GROUP_URL WITH YOUR FACEBOOK GROUP LINK

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// SUAS CHAVES DO SUPABASE - troca pelas suas se mudar
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// SEU LINK DO GRUPO VIP
const GROUP_URL = "https://www.facebook.com/share/g/1EKJ8WqU9d/"

export default function App() {
  const [links, setLinks] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [senha, setSenha] = useState('')
  const [form, setForm] = useState({ titulo: '', url: '', imagem: '', bonus: '' })

  // Checa se é admin pela url
  useEffect(() => {
    if (window.location.hash === '#admin') {
      setIsAdmin(true)
    }
    buscarLinks()
  }, [])

  // Busca plataformas do Supabase
  async function buscarLinks() {
    const { data, error } = await supabase
     .from('links_roleta')
     .select('*')
     .order('created_at', { ascending: false })

    if (!error) setLinks(data)
  }

  // Cadastra nova plataforma
  async function handleSubmit(e) {
    e.preventDefault()
    const { error } = await supabase.from('links_roleta').insert([{
      titulo: form.titulo,
      url: form.url,
      imagem: form.imagem,
      bonus: form.bonus || '',
      cliques: 0
    }])

    if (!error) {
      setForm({ titulo: '', url: '', imagem: '', bonus: '' })
      buscarLinks()
      alert('Plataforma adicionada!')
    } else {
      alert('Erro: ' + error.message)
    }
  }

  // Deleta plataforma
  async function deletar(id) {
    if (confirm('Deletar essa plataforma?')) {
      await supabase.from('links_roleta').delete().eq('id', id)
      buscarLinks()
    }
  }

  // Conta clique e abre link
  async function abrirLink(link) {
    await supabase.from('links_roleta').update({ cliques: (link.cliques || 0) + 1 }).eq('id', link.id)
    window.open(link.url, '_blank')
    buscarLinks()
  }

  // Login admin simples
  if (isAdmin && senha!== '06032025') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-4 text-center">Admin</h1>
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full border p-3 rounded-lg mb-4"
          />
          <p className="text-xs text-gray-500 text-center">Acesse /#admin</p>
        </div>
      </div>
    )
  }

  // PAINEL ADMIN
  if (isAdmin && senha === 'Grazi2024!') {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h1 className="text-2xl font-bold mb-6">Cadastrar Plataforma</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                placeholder="Nome: 98A.COM"
                value={form.titulo}
                onChange={(e) => setForm({...form, titulo: e.target.value})}
                className="w-full border p-3 rounded-lg"
              />
              <input
                required
                placeholder="Link de afiliado: https://..."
                value={form.url}
                onChange={(e) => setForm({...form, url: e.target.value})}
                className="w-full border p-3 rounded-lg"
              />
              <input
                required
                placeholder="URL da Imagem 512x512"
                value={form.imagem}
                onChange={(e) => setForm({...form, imagem: e.target.value})}
                className="w-full border p-3 rounded-lg"
              />
              <input
                placeholder="Bônus (opcional)"
                value={form.bonus}
                onChange={(e) => setForm({...form, bonus: e.target.value})}
                className="w-full border p-3 rounded-lg"
              />
              <button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-bold">
                Salvar Plataforma
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Plataformas Cadastradas: {links.length}</h2>
            <div className="space-y-3">
              {links.map(link => (
                <div key={link.id} className="flex items-center gap-4 border p-3 rounded-lg">
                  <img src={link.imagem} className="w-16 h-16 object-contain rounded" />
                  <div className="flex-1">
                    <p className="font-bold">{link.titulo}</p>
                    <p className="text-xs text-gray-500">Cliques: {link.cliques || 0}</p>
                  </div>
                  <button onClick={() => deletar(link.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">
                    Deletar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // SITE PRINCIPAL
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* HEADER PRETO */}
      <div className="bg-[#0a0a0a] text-white py-6 px-4 text-center">
        <h1 className="text-lg md:text-2xl font-black uppercase tracking-tight">
          PLATAFORMAS COM BÔNUS DE ROLETA NO CADASTRO
        </h1>
        <a
          href={GROUP_URL}
          target="_blank"
          className="inline-block mt-4 bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition"
        >
          ENTRA NO GRUPO VIP DO FACEBOOK
        </a>
      </div>

      {/* GRID DE PLATAFORMAS */}
      <div className="max-w-6xl mx-auto p-3 md:p-6">
        {links.length === 0? (
          <div className="text-center py-20 text-gray-400">
            Nenhuma plataforma cadastrada ainda
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {links.map((link) => (
              <div
                key={link.id}
                onClick={() => abrirLink(link)}
                className="cursor-pointer group"
              >
                <div className="rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300">
                  {/* IMAGEM COMPLETA SEM CORTE */}
                  <img
                    src={link.imagem}
                    alt={link.titulo}
                    className="w-full aspect-square object-contain bg-white"
                  />
                  {/* SÓ NOME NO PÉ PRETO */}
                  <div className="bg-black py-2.5 text-center">
                    <p className="text-white font-black text- uppercase tracking-widest">
                      {link.titulo}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
