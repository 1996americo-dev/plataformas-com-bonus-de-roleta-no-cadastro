import { useEffect, useState } from 'react'
import { supabase } from './supabase'

const SENHA_ADMIN = "Grazi2024!"

export default function App(){
  const [links, setLinks] = useState([])
  const [isAdmin, setIsAdmin] = useState(window.location.hash.includes('admin'))
  const [logado, setLogado] = useState(false)
  const [senha, setSenha] = useState('')
  const [form, setForm] = useState({titulo:'',url:'',emoji:'🎯',imagem:'',categoria:'plataforma',bonus:''})
  const [preview, setPreview] = useState('')

  async function carregar(){
    const {data} = await supabase.from('links_roleta').select('*').order('cliques',{ascending:false})
    if(data) setLinks(data)
  }

  useEffect(()=>{ carregar() },[])

  async function clicar(link){
    await supabase.from('links_roleta').update({cliques:(link.cliques||0)+1}).eq('id',link.id)
    window.open(link.url,'_blank')
    carregar()
  }

  function handleImagem(e){
    const file = e.target.files[0]
    if(!file) return
    setPreview(URL.createObjectURL(file))
    // aqui você adiciona o upload pro supabase se quiser
  }

  async function salvarLink(){
    if(!form.titulo ||!form.url) return alert('Preenche título e URL')
    await supabase.from('links_roleta').insert([form])
    setForm({titulo:'',url:'',emoji:'🎯',imagem:'',categoria:'plataforma',bonus:''})
    setPreview('')
    carregar()
  }

  async function deletar(id){
    if(confirm('Deletar?')) {
      await supabase.from('links_roleta').delete().eq('id', id)
      carregar()
    }
  }

  const totalCliques = links.reduce((acc, l) => acc + (l.cliques || 0), 0)

  // TELA DE LOGIN ADMIN
  if(isAdmin &&!logado){
    return (
      <div style={{padding:20, fontFamily:'Arial', maxWidth:400, margin:'50px auto', textAlign:'center'}}>
        <h2>Área Admin</h2>
        <input 
          type="password" 
          placeholder="Senha" 
          value={senha} 
          onChange={e=>setSenha(e.target.value)}
          style={{padding:10, width:'100%', marginBottom:10, borderRadius:5, border:'1px solid #ccc'}}
        />
        <button 
          onClick={()=>{
            if(senha === SENHA_ADMIN) setLogado(true)
            else alert('Senha errada!')
          }}
          style={{padding:'10px 20px', background:'black', color:'white', border:'none', borderRadius:5, cursor:'pointer', width:'100%'}}
        >
          Entrar
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial', maxWidth: 900, margin: '0 auto' }}>
      
      {isAdmin && logado && (
        <>
          <div style={{ background: '#FFEB3B', padding: 15, textAlign: 'center', fontWeight: 'bold', borderRadius: 8, marginBottom: 20, border: '2px solid black' }}>
            ADMIN - {links.length} links
            <div style={{ fontSize: 24, marginTop: 5 }}>[TOTAL: {totalCliques} CLIQUES]</div>
          </div>

          <div style={{border:'1px solid #ccc', padding:15, borderRadius:8, marginBottom:20}}>
            <h3>Cadastrar Nova Plataforma</h3>
            <input placeholder="Título" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})} style={{width:'100%', padding:8, marginBottom:8}}/>
            <input placeholder="URL" value={form.url} onChange={e=>setForm({...form,url:e.target.value})} style={{width:'100%', padding:8, marginBottom:8}}/>
            <input placeholder="Bônus" value={form.bonus} onChange={e=>setForm({...form,bonus:e.target.value})} style={{width:'100%', padding:8, marginBottom:8}}/>
            <input placeholder="Emoji" value={form.emoji} onChange={e=>setForm({...form,emoji:e.target.value})} style={{width:'100%', padding:8, marginBottom:8}}/>
            <button onClick={salvarLink} style={{background:'green', color:'white', padding:'10px 20px', border:'none', borderRadius:5, cursor:'pointer'}}>Salvar Link</button>
          </div>
        </>
      )}

      <h1 style={{ textAlign: 'center' }}>PLATAFORMAS COM BÔNUS DE ROLETA NO CADASTRO</h1>

      <div style={{ display: 'grid', gap: 15, marginTop: 20 }}>
        {links.map(l => (
          <div key={l.id} style={{ border: '1px solid #ddd', padding: 15, borderRadius: 10, background:'#f9f9f9' }}>
            <h3>{l.emoji} {l.titulo}</h3>
            <p><strong>Bônus:</strong> {l.bonus || l.categoria}</p>
            {isAdmin && logado && <p style={{ color: 'blue' }}>Cliques: {l.cliques || 0}</p>}
            <button onClick={() => clicar(l)} style={{ background: 'green', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', marginRight:10 }}>
              ACESSAR PLATAFORMA
            </button>
            {isAdmin && logado && (
              <button onClick={() => deletar(l.id)} style={{ background: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                Deletar
              </button>
            )}
          </div>
        ))}
      </div>

      {links.length === 0 && <p style={{ textAlign: 'center', marginTop: 30 }}>Nenhum link cadastrado ainda.</p>}
    </div>
  )
}