/* MOYO — «мелкая жизнь»: магнитные кнопки, счётчики цифр, компактная кнопка менеджера */
(()=>{
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine=matchMedia('(pointer: fine)').matches;

  /* 1) магнитные кнопки: тянутся к курсору, отпускают с пружиной (через translate, чтобы не мешать transform) */
  if(fine&&!reduce){
    document.querySelectorAll('.btn-p,.btn-m,.btn-w,.btn-g,.role').forEach(el=>{
      const k=.08,max=4;
      el.classList.add('mag');
      el.addEventListener('pointermove',e=>{
        const r=el.getBoundingClientRect();
        const x=Math.max(-max,Math.min(max,(e.clientX-r.left-r.width/2)*k));
        const y=Math.max(-max,Math.min(max,(e.clientY-r.top-r.height/2)*k));
        el.style.translate=`${x.toFixed(1)}px ${y.toFixed(1)}px`;
      });
      el.addEventListener('pointerleave',()=>{el.style.translate='0px 0px'});
    });
  }

  /* 2) счётчики: цифры добегают до значения, когда блок появляется на экране */
  const nodes=[...document.querySelectorAll('.pp-head .acc,.ab-num b,[data-count]')]
    .filter(el=>!el.children.length&&/\d/.test(el.textContent));
  const fmt=(n,sep)=>sep?String(n).replace(/\B(?=(\d{3})+(?!\d))/g,sep):String(n);
  nodes.forEach(el=>{
    const src=el.textContent,m=src.match(/(\d[\d\s ]*\d|\d)/);if(!m)return;
    const sepM=m[1].match(/[\s ]/),sep=sepM?sepM[0]:'';
    const target=parseInt(m[1].replace(/[\s ]/g,''),10);
    const pre=src.slice(0,m.index),post=src.slice(m.index+m[1].length);
    if(reduce||!target)return;
    el.textContent=pre+fmt(0,sep)+post;el.style.fontVariantNumeric='tabular-nums';
    const io=new IntersectionObserver(([e])=>{
      if(!e.isIntersecting)return;io.disconnect();
      const t0=performance.now(),dur=target>50?1600:1100;
      (function step(now){
        const p=Math.min(1,(now-t0)/dur),v=Math.round(target*(1-Math.pow(1-p,4)));
        el.textContent=pre+fmt(v,sep)+post;
        if(p<1)requestAnimationFrame(step);else{el.textContent=src;el.style.fontVariantNumeric=''}
      })(t0);
    },{threshold:.6});
    io.observe(el);
  });

  /* 3) кнопка менеджера: после первого экрана сворачивается в круглый аватар, при наведении раскрывается */
  const help=document.getElementById('help');
  if(help){
    const upd=()=>help.classList.toggle('mini',scrollY>innerHeight*.8&&!document.body.classList.contains('chat-on'));
    addEventListener('scroll',upd,{passive:true});upd();
  }
})();
