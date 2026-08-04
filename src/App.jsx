import { useEffect, useState } from 'react'
import { supabase } from './supabase'

const SENHA_ADMIN = "Grazi2024!"
const LOGO_URL = "https://i.imgur.com/8Km9tLL.png"

export default function App(){
  const [links, setLinks] = useState([])
  const [isAdmin, setIsAdmin] = useState(window.location.hash.includes('admin'))
  const [logado, setLogado] = useState(false)
  const [senha, setSenha] = useState('')
  const [form, setForm] = useState({titulo:'',url:'',emoji:'🎯',imagem:'',categoria:'plataforma',bonus:''})
  const [formSocial, setFormSocial] = useState({titulo:'',url:'',emoji:'📲'})
  const [preview, setPreview] = useState('')
  const [carregando, setCarregando] = useState(false)

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

  async function handleImagem(e){
    const file = e.target.files[0]
    if(!file) return
    setPreview(URL.createObjectURL(file))
    setCarregando(true)
    const nome = `${Date.now()}_${file.name}`
    const {error} = await supabase.storage.from('imagens').upload(nome, file)
    if(error){
      const reader = new FileReader()
      reader.onloadend = ()=> setForm(f=>({...f, imagem: reader.result}))
      reader.readAsDataURL(file)
    } else {
      const {data} = supabase.storage.from('imagens').getPublicUrl(nome)
      setForm(f=>({...f, imagem: data.publicUrl}))
    }
    setCarregando(false)
  }

  async function salvarLink(){
    if(!form.titulo ||!form.url) return alert('Título e URL obrigatórios')
    await supabase.from('links_roleta').insert([{...form, cliques:0}])
    setForm({titulo:'',url:'',emoji:'🎯',imagem:'',categoria:'plataforma',bonus:''})
    setPreview('')
    carregar()
  }

  async function salvarSocial(){
    if(!formSocial.titulo ||!formSocial.url) return alert('Preencha rede social')
    await supabase.from('links_roleta').insert([{...formSocial, categoria:'social_topo', cliques:0, bonus:'REDE SOCIAL'}])
    setFormSocial({titulo:'',url:'',emoji:'📲'})
    carregar()
  }

  async function deletar(id){
    if(confirm('Deletar?')){ await supabase.from('links_roleta').delete().eq('id',id); carregar() }
  }

  const totalCliques = links.filter(l=>l.categoria!=='social_topo').reduce((a,l)=>a+(l.cliques||0),0)
  const linksTopo = links.filter(l=>l.categoria==='social_topo')
  const linksPlataformas = links.filter(l=>l.categoria!=='social_topo')

  if(isAdmin &&!logado){
    return (
      <div style={{padding:20, fontFamily:'Arial', maxWidth:400, margin:'50px auto', textAlign:'center'}}>
        <img src={LOGO_URL} style={{width:100, height:100, borderRadius:'50%', border:'4px solid #FFEB3B', objectFit:'cover'}}/>
        <h2 style={{marginTop:15}}>Área Admin</h2>
        <input type="password" placeholder="Senha" value={senha} onChange={e=>setSenha(e.target.value)} style={{padding:12, width:'100%', marginBottom:10, borderRadius:8, border:'1px solid #ccc'}}/>
        <button onClick={()=>{ if(senha===SENHA_ADMIN) setLogado(true); else alert('Senha errada')}} style={{padding:'12px 20px', background:'black', color:'white', border:'none', borderRadius:8, cursor:'pointer', width:'100%', fontWeight:'bold'}}>Entrar</button>
      </div>
    )
  }

  return (
    <div style={{ fontFamily:'Arial', background:'#f5f5f7', minHeight:'100vh' }}>
      <header style={{background:'linear-gradient(135deg, #0f0f0f 0%, #2d2d2d 100%)', padding:'30px 20px', textAlign:'center', color:'white'}}>
        <img src={LOGO_URL} alt="Logo" style={{width:100, height:100, borderRadius:'50%', border:'4px solid #FFEB3B', objectFit:'cover', boxShadow:'0 4px 15px rgba(255,235,59,0.3)'}}/>
        <h1 style={{margin:'15px 0 0 0', fontSize:24, letterSpacing:1, fontWeight:'bold'}}>PLATAFORMAS COM BÔNUS DE ROLETA NO CADASTRO</h1>
        {linksTopo.length>0 && (
          <div style={{marginTop:20, display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap'}}>
            {linksTopo.map(s=>(
              <a key={s.id} href={s.url} target="_blank" style={{background:'white', color:'black', padding:'8px 16px', borderRadius:20, textDecoration:'none', fontWeight:'bold', fontSize:14}}>
                {s.emoji} {s.titulo}
              </a>
            ))}
          </div>
        )}
      </header>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding:20 }}>
        {isAdmin && logado && (
          <>
            <div style={{ background: '#FFEB3B', padding: 15, textAlign: 'center', fontWeight: 'bold', borderRadius: 10, marginBottom: 20, border: '2px solid black' }}>
              ADMIN - {linksPlataformas.length} links
              <div style={{ fontSize: 24, marginTop: 5 }}>[TOTAL: {totalCliques} CLIQUES]</div>
            </div>
            <div style={{border:'1px solid #ddd', padding:15, borderRadius:12, marginBottom:20, background:'#fff'}}>
              <h3>🌐 Cadastrar Rede Social do Topo</h3>
              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                <input placeholder="Emoji" value={formSocial.emoji} onChange={e=>setFormSocial({...formSocial,emoji:e.target.value})} style={{width:80, padding:10, borderRadius:8, border:'1px solid #ccc'}}/>
                <input placeholder="Nome" value={formSocial.titulo} onChange={e=>setFormSocial({...formSocial,titulo:e.target.value})} style={{flex:1, padding:10, borderRadius:8, border:'1px solid #ccc'}}/>
                <input placeholder="Link" value={formSocial.url} onChange={e=>setFormSocial({...formSocial,url:e.target.value})} style={{flex:1, padding:10, borderRadius:8, border:'1px solid #ccc'}}/>
                <button onClick={salvarSocial} style={{background:'#111', color:'white', padding:'10px 15px', border:'none', borderRadius:8, cursor:'pointer'}}>Add Topo</button>
              </div>
            </div>
            <div style={{border:'1px solid #ddd', padding:15, borderRadius:12, marginBottom:25, background:'#fff'}}>
              <h3>Cadastrar Nova Plataforma</h3>
              <input placeholder="Título" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})} style={{width:'100%', padding:10, marginBottom:8, borderRadius:8, border:'1px solid #ccc'}}/>
              <input placeholder="URL" value={form.url} onChange={e=>setForm({...form,url:e.target.value})} style={{width:'100%', padding:10, marginBottom:8, borderRadius:8, border:'1px solid #ccc'}}/>
              <input placeholder="Bônus" value={form.bonus} onChange={e=>setForm({...form,bonus:e.target.value})} style={{width:'100%', padding:10, marginBottom:8, borderRadius:8, border:'1px solid #ccc'}}/>
              <input placeholder="Emoji 🎯" value={form.emoji} onChange={e=>setForm({...form,emoji:e.target.value})} style={{width:'100%', padding:10, marginBottom:8, borderRadius:8, border:'1px solid #ccc'}}/>
              <label style={{fontWeight:'bold'}}>Imagem 512x512:</label>
              <input type="file" accept="image/*" onChange={handleImagem} style={{width:'100%', padding:10, marginBottom:8}}/>
              {preview && <img src={preview} style={{width:128, height:128, objectFit:'cover', borderRadius:8, border:'1px solid #ccc'}}/>}
              <button onClick={salvarLink} disabled={carregando} style={{background:'green', color:'white', padding:'12px', border:'none', borderRadius:8, cursor:'pointer', marginTop:10, width:'100%', fontWeight:'bold'}}>{carregando?'Enviando...':'Salvar Link'}</button>
            </div>
          </>
        )}
        <div style={{ display: 'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginTop: 20 }}>
          {linksPlataformas.map(l => (
            <div key={l.id} style={{ border: '1px solid #e5e7eb', padding: 0, borderRadius: 16, background:'#fff', overflow:'hidden', boxShadow:'0 4px 12px rgba(0,0,0,0.08)' }}>
              {l.imagem && <img src={l.imagem} alt={l.titulo} style={{width:'100%', height:200, objectFit:'cover'}}/>}
              <div style={{padding:15}}>
                <h3 style={{margin:'0 0 5px 0'}}>{l.emoji} {l.titulo}</h3>
                <p style={{color:'#22c55e', fontWeight:'bold', margin:'5px 0'}}>{l.bonus}</p>
                {isAdmin && logado && <p style={{ color: 'blue' }}>Cliques: {l.cliques || 0}</p>}
                <button onClick={() => clicar(l)} style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', padding: '12px', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 'bold', width:'100%', marginTop:10, fontSize:16 }}>ACESSAR PLATAFORMA →</button>
                {isAdmin && logado && <button onClick={() => deletar(l.id)} style={{ background: '#ef4444', color: 'white', padding: '8px', border: 'none', borderRadius: 8, cursor: 'pointer', width:'100%', marginTop:8 }}>Deletar</button>}
              </div>
            </div>
          ))}
        </div>
        {linksPlataformas.length === 0 && <p style={{ textAlign: 'center', marginTop: 40, color:'#888' }}>Nenhum link cadastrado ainda. Vá no /#admin para cadastrar.</p>}
      </div>
    </div>
  )
}