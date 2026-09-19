(async function(){
  const app=document.getElementById('app');
  try{
    const paths=[
      '/assets/app-chunks/0.txt?v=2.0.0',
      '/assets/app-chunks/1.txt?v=2.0.0',
      '/assets/app-chunks/2.txt?v=2.0.0',
      '/assets/app-chunks/3.txt?v=2.0.0'
    ];
    const parts=await Promise.all(paths.map(async p=>{
      const r=await fetch(p,{cache:'no-store'});
      if(!r.ok) throw new Error('Could not load application bundle ('+r.status+')');
      return (await r.text()).trim();
    }));
    const b64=parts.join('');
    const bin=atob(b64);
    const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
    if(typeof DecompressionStream==='undefined'){
      throw new Error('This browser does not support the application decompressor. Please use an up-to-date Chrome, Edge or Safari browser.');
    }
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const code=await new Response(stream).text();
    if(!code.includes('window.RWH')) throw new Error('Application bundle validation failed.');
    (0,eval)(code);
  }catch(err){
    console.error(err);
    if(app) app.innerHTML='<div class="card"><h2>Work Hub could not start</h2><p>'+String(err.message||err)+'</p><p class="muted">Refresh once. If this remains, open Settings in your browser and clear this site cache, then reopen the Hub.</p></div>';
  }
})();