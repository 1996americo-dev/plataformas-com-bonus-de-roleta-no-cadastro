import { useEffect, useState } from 'react'
import { supabase } from './supabase'

const SENHA_ADMIN = "Grazi2024!"

export default function App(){
  const [links, setLinks] = useState([])
  const [isAdmin, setIsAdmin] = useState(window.location.hash.includes('admin'))
  const [logado, setLogado] = useState(false)
  const [senha, setSenha] = useState('')
  const [form, setForm] = useState({titulo:'', url:'', emoji:'🎯', imagem:'', hot:false, categoria:'plataforma'})
  const [preview, setPreview] = useState('')

  async function carregar(){
    const { data } = await supabase.from('links_roleta').select('*').order('cliques',{ascending:false})
    if(data) setLinks(data)
  }
  useEffect(()=>{carregar()},[])

  async function clicar(link){
    await supabase.from('links_roleta').update({cliques:(link.cliques||0)+1}).eq('id',link.id)
    window.open(link.url,'_blank')
  }

  function handleImagem(e){
    const file=e.target.files[0]
    if(!file) return
    setPreview(URL.createObjectURL(file))
    const r=new FileReader()
    r.onload=()=>setForm(f=>({...f,imagem:r.result}))
    r.readAsDataURL(file)
  }

  async function salvarLink(){
    if(!form.titulo ||!form.url) return alert('Preencha titulo e URL')
    const { error } = await supabase.from('links_roleta').insert([{
      titulo:form.titulo,
      url:form.url,
      emoji:form.emoji,
      imagem:form.imagem,
      hot:form.hot,
      categoria:form.categoria,
      ordem:links.length,
      cliques:0,
      subtitulo:''
    }])
    if(error) alert(error.message)
    else {
      setForm({titulo:'',url:'',emoji:'🎯',imagem:'',hot:false,categoria:'plataforma'})
      setPreview('')
      carregar()
    }
  }

  async function deletar(id){
    if(!confirm('Excluir?')) return
    await supabase.from('links_roleta').delete().eq('id',id)
    carregar()
  }

  const totalCliques = links.reduce((acc,l)=>acc+(l.cliques||0),0)
  const principais = links.filter(l=> l.categoria==='principal' || /GRUPO|WHATS|FACEBOOK|INSTA|VIP/i.test(l.titulo))
  const plataformas = links.filter(l=>!(l.categoria==='principal' || /GRUPO|WHATS|FACEBOOK|INSTA|VIP/i.test(l.titulo)))

  if(isAdmin &&!logado){
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0a0a'}}>
        <div style={{background:'#151515',padding:24,borderRadius:16,width:320,border:'1px solid #2a'}}>
          <h2 style={{color:'#fff'}}>ADMIN</h2>
          <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} placeholder="Senha" style={{width:'100%',padding:12,marginTop:12,borderRadius:8,background:'#000',color:'#fff',border:'1px solid #333'}}/>
          <button onClick={()=>{if(senha===SENHA_ADMIN)setLogado(true);else alert('Senha errada')}} style={{width:'100%',marginTop:12,padding:12,background:'#fbbf24',color:'#000',fontWeight:900,borderRadius:8,border:'none'}}>ENTRAR</button>
        </div>
      </div>
    )
  }

  if(isAdmin && logado){
    return (
      <div style={{maxWidth:520,margin:'0 auto',padding:16,color:'#fff'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h2 style={{fontSize:14}}>ADMIN - {links.length} links</h2>
          <span style={{background:'#fbbf24',color:'#000',padding:'4px 10px',borderRadius:99,fontWeight:900,fontSize:12}}>TOTAL CLIQUES: {totalCliques}</span>
        </div>

        <div style={{background:'#151515',padding:12,borderRadius:12,marginTop:10,border:'1px solid #222'}}>
          <select value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})} style={{width:'100%',padding:10,marginBottom:8,background:'#000',color:'#fff',border:'1px solid #fbbf24',borderRadius:8}}>
            <option value="plataforma">Plataforma (grade 2x2)</option>
            <option value="principal">PRINCIPAL (topo azul)</option>
          </select>
          <input placeholder="Titulo ex: 98A.COM" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})} style={{width:'100%',padding:10,marginBottom:8,background:'#000',color:'#fff',border:'1px solid #333',borderRadius:8}}/>
          <input placeholder="URL https://..." value={form.url} onChange={e=>setForm({...form,url:e.target.value})} style={{width:'100%',padding:10,marginBottom:8,background:'#000',color:'#fff',border:'1px solid #333',borderRadius:8}}/>
          <div style={{border:'1px dashed #333',padding:8,borderRadius:8,background:'#000'}}>
            <input type="file" accept="image/*" onChange={handleImagem} style={{color:'#fff',fontSize:11}} />
            {preview && <img src={preview} style={{width:'100%',marginTop:8,borderRadius:8,aspectRatio:'1/1',objectFit:'contain',background:'#111'}}/>}
          </div>
          <button onClick={salvarLink} style={{width:'100%',marginTop:10,padding:12,background:'#fbbf24',color:'#000',fontWeight:900,borderRadius:8,border:'none'}}>SALVAR</button>
        </div>

        <div style={{marginTop:16}}>
          {links.map(l=>(
            <div key={l.id} style={{display:'flex',alignItems:'center',gap:8,background:'#1a1a1e',padding:'10px 12px',borderRadius:10,marginBottom:8,border:'1px solid #2a2a2e'}}>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700}}>{l.categoria==='principal'?'⭐ ':''}{l.titulo}</div>
                <div style={{fontSize:10,color:'#888'}}>{l.url.slice(0,35)}...</div>
              </div>
              <div style={{textAlign:'center',minWidth:60}}>
                <div style={{fontSize:18,fontWeight:900,color:'#fbbf24'}}>{l.cliques||0}</div>
                <div style={{fontSize:9,color:'#888'}}>CLIQUES</div>
              </div>
              <button onClick={()=>deletar(l.id)} style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:6,padding:'6px 10px',fontWeight:900}}>X</button>
            </div>
          ))}
        </div>
        <button onClick={()=>{location.hash='';location.href='/'}} style={{width:'100%',marginTop:12,padding:10,background:'#222',color:'#fff',border:'none',borderRadius:8}}>Ver site</button>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'#070708',display:'flex',justifyContent:'center',padding:14}}>
      <div style={{width:'100%',maxWidth:900}}>
        <div style={{textAlign:'center',padding:'16px 0 8px'}}>
          <div style={{width:110,height:110,margin:'0 auto 12px',borderRadius:'50%',background:'#0f172a',border:'3px solid #fbbf24',display:'flex',alignItems:'center',justifyContent:'center',fontSize:50,boxShadow:'0 0 25px rgba(251,191,36,0.6)'}}>🎰</div>
          <h1 style={{fontSize:18,fontWeight:900,color:'#fff',lineHeight:1.2}}>PLATAFORMAS COM BONUS DE ROLETA<br/>NO CADASTRO</h1>
        </div>

        {principais.length>0 && (
          <div style={{margin:'16px 0'}}>
            {principais.map(l=>(
              <a key={l.id} onClick={e=>{e.preventDefault();clicar(l)}} href={l.url} style={{display:'flex',alignItems:'center',gap:12,width:'100%',padding:'14px 16px',marginBottom:10,borderRadius:14,background:'#0f152a',border:'1px solid #3b82f6',textDecoration:'none',color:'#fff'}}>
                <div style={{width:40,height:40,borderRadius:8,background:'#1e40af',display:'flex',alignItems:'center',justifyContent:'center'}}>{l.emoji}</div>
                <div style={{flex:1}}><b style={{fontSize:13}}>{l.titulo}</b><div style={{fontSize:10,color:'#93c5fd'}}>FACEBOOK • GRUPO VIP</div></div>
                <div style={{width:28,height:28,borderRadius:'50%',background:'#222',display:'flex',alignItems:'center',justifyContent:'center'}}>→</div>
              </a>
            ))}
          </div>
        )}

        <div style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:12}}>
          {plataformas.map(l=>(
            <a key={l.id} onClick={e=>{e.preventDefault();clicar(l)}} href={l.url} style={{display:'block',background:'#151517',border:'1px solid #2a2e',borderRadius:14,overflow:'hidden',textDecoration:'none',color:'#fff'}}>
              {l.imagem? <img src={l.imagem} style={{width:'100%',aspectRatio:'1/1',objectFit:'contain',display:'block',background:'#0f0f0f'}} /> : <div style={{width:'100%',aspectRatio:'1/1',background:'#222',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30}}>{l.emoji}</div>}
              <div style={{padding:'8px 10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <b style={{fontSize:11}}>{l.titulo}</b>
                <span style={{fontSize:10,background:'#fbbf24',color:'#000',padding:'2px 6px',borderRadius:999,fontWeight:900}}>→</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}