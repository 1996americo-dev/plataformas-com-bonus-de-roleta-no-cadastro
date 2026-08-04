import { useEffect, useState } from 'react'
import { supabase } from './supabase'

const SENHA_ADMIN = "Grazi2024!"

export default function App(){
  const [links, setLinks] = useState([])
  const [isAdmin, setIsAdmin] = useState(window.location.hash.includes('admin'))
  const [logado, setLogado] = useState(false)
  const [senha, setSenha] = useState('')
  const [form, setForm] = useState({titulo:'',url:'',emoji:'🎯',imagem:'',categoria:'plataforma',bonus:'',descricao:''})
  const [preview, setPreview] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function carregar(){
    const {data, error} = await supabase.from('links_roleta').select('*').order('cliques',{ascending:false})
    console.log('dados:', data, error)
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

    // Preview na hora
    setPreview(URL.createObjectURL(file))

    // Valida tamanho 512x512 (avisa mas deixa)
    const img = new Image()
    img.onload = () => {
      if(img.width!== 512 || img.height!== 512){
        alert(`Imagem está ${img.width}x${img.height}, ideal é 512x512! Mas vou aceitar.`)
      }
    }
    img.src = URL.createObjectURL(file)

    setCarregando(true)
    // Upload pro Supabase Storage
    const nomeArquivo = `${Date.now()}_${file.name}`
    const {data, error} = await supabase.storage.from('imagens').upload(nomeArquivo, file)

    if(error){
      // Se não tem bucket 'imagens', salva como base64 mesmo
      console.log('Erro upload bucket:', error)
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm(f => ({...f, imagem: reader.result}))
      }
      reader.readAsDataURL(file)
    } else {
      const {data: urlData} = supabase.storage.from('imagens').getPublicUrl(nomeArquivo)
      setForm(f => ({...f, imagem: urlData.publicUrl}))
    }
    setCarregando(false)
  }

  async function salvarLink(){
    if(!form.titulo ||!form.url) return alert('Preencha título e URL!')
    const {error} = await supabase.from('links_roleta').insert([{...form, cliques: 0}])
    if(error) alert('Erro: '+error.message)
    else {
      setForm({titulo:'',url:'',emoji:'🎯',imagem:'',categoria:'plataforma',bonus:'',descricao:''})
      setPreview('')
      carregar()
    }
  }

  async function deletar(id){
    if(confirm('Deletar essa plataforma?')){
      await supabase.from('links_roleta').delete().eq('id', id)
      carregar()
    }
  }

  const totalCliques = links.reduce((acc, l) => acc + (l.cliques || 0), 0)

  if(isAdmin &&!logado){
    return (
      <div style={{padding:20, fontFamily:'Arial', maxWidth:400, margin:'50px auto', textAlign:'center'}}>
        <h2>Área Admin</h2>
        <input type="password" placeholder="Senha" value={senha} onChange={e=>setSenha(e.target.value)} style={{padding:10, width:'100%', marginBottom:10, borderRadius:5, border:'1px solid #ccc'}}/>
        <button onClick={()=>{ if(senha===SENHA_ADMIN) setLogado(true); else alert('Senha errada!')}} style={{padding:'10px 20px', background:'black', color:'white', border:'none', borderRadius:5, cursor:'pointer', width:'100%'}}>Entrar</button>
      </div>
    )
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial', maxWidth: 1000, margin: '0 auto' }}>
      {isAdmin && logado && (
        <div style={{ background: '#FFEB3B', padding: 15, textAlign: 'center', fontWeight: 'bold', borderRadius: 8, marginBottom: 20, border: '2px solid black' }}>
          ADMIN - {links.length} links
          <div style={{ fontSize: 24, marginTop: 5 }}>[TOTAL: {totalCliques} CLIQUES]</div>
        </div>
      )}

      {isAdmin && logado && (
        <div style={{border:'1px solid #ccc', padding:15, borderRadius:8, marginBottom:25, background:'#fff'}}>
          <h3>Cadastrar Nova Plataforma</h3>
          <input placeholder="Título" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})} style={{width:'100%', padding:10, marginBottom:8, borderRadius:5, border:'1px solid #ccc'}}/>
          <input placeholder="URL" value={form.url} onChange={e=>setForm({...form,url:e.target.value})} style={{width:'100%', padding:10, marginBottom:8, borderRadius:5, border:'1px solid #ccc'}}/>
          <input placeholder="Bônus" value={form.bonus} onChange={e=>setForm({...form,bonus:e.target.value})} style={{width:'100%', padding:10, marginBottom:8, borderRadius:5, border:'1px solid #ccc'}}/>
          <input placeholder="Emoji 🎯" value={form.emoji} onChange={e=>setForm({...form,emoji:e.target.value})} style={{width:'100%', padding:10, marginBottom:8, borderRadius:5, border:'1px solid #ccc'}}/>

          <label style={{fontWeight:'bold', display:'block', marginTop:10}}>Imagem 512x512:</label>
          <input type="file" accept="image/*" onChange={handleImagem} style={{width:'100%', padding:10, marginBottom:8}}/>
          {preview && <img src={preview} alt="preview" style={{width:128, height:128, objectFit:'cover', borderRadius:8, border:'1px solid #ccc'}}/>}
          {form.imagem &&!preview && <img src={form.imagem} alt="preview" style={{width:128, height:128, objectFit:'cover', borderRadius:8}}/>}

          <button onClick={salvarLink} disabled={carregando} style={{background:'green', color:'white', padding:'12px 20px', border:'none', borderRadius:5, cursor:'pointer', marginTop:10, width:'100%', fontWeight:'bold'}}>
            {carregando? 'Enviando...' : 'Salvar Link'}
          </button>
        </div>
      )}

      <h1 style={{ textAlign: 'center', fontSize:28, fontWeight:'bold' }}>PLATAFORMAS COM BÔNUS DE ROLETA NO CADASTRO</h1>

      <div style={{ display: 'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginTop: 20 }}>
        {links.map(l => (
          <div key={l.id} style={{ border: '1px solid #ddd', padding: 15, borderRadius: 12, background:'#fff', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}>
            {l.imagem && <img src={l.imagem} alt={l.titulo} style={{width:'100%', height:200, objectFit:'cover', borderRadius:8, marginBottom:10}}/>}
            <h3 style={{margin:'10px 0'}}>{l.emoji} {l.titulo}</h3>
            <p style={{color:'#555'}}>{l.bonus || l.descricao}</p>
            {isAdmin && logado && <p style={{ color: 'blue', fontWeight:'bold' }}>Cliques: {l.cliques || 0}</p>}
            <button onClick={() => clicar(l)} style={{ background: '#22c55e', color: 'white', padding: '12px 20px', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', width:'100%' }}>
              ACESSAR PLATAFORMA
            </button>
            {isAdmin && logado && <button onClick={() => deletar(l.id)} style={{ background: 'red', color: 'white', padding: '8px', border: 'none', borderRadius: 6, cursor: 'pointer', marginTop:8, width:'100%' }}>Deletar</button>}
          </div>
        ))}
      </div>

      {links.length === 0 && <p style={{ textAlign: 'center', marginTop: 30, color:'#666' }}>Nenhum link cadastrado ainda.</p>}
    </div>
  )
}