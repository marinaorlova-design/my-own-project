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

  /* 4) бархат: блик ходит за курсором, цвет переливается сирень ↔ персик по горизонтали, движение «приглаживает ворс» */
  const vel=document.querySelector('.velvet');
  if(vel){
    const L=[156,140,224],P=[255,176,136];
    let tx=.5,ty=.4,x=.5,y=.4,sp=0,ts=0,lx=null,ly=null,raf=0;
    const tick=()=>{
      x+=(tx-x)*.08;y+=(ty-y)*.08;sp+=(ts-sp)*.06;ts*=.92;
      const k=Math.min(1,Math.max(0,x));const c=L.map((v,i)=>Math.round(v+(P[i]-v)*k*k));
      vel.style.setProperty('--mx',(x*100).toFixed(2)+'%');vel.style.setProperty('--my',(y*100).toFixed(2)+'%');
      vel.style.setProperty('--vc',c.join(','));vel.style.setProperty('--vs',Math.min(1,.35+sp).toFixed(3));
      raf=(Math.abs(tx-x)+Math.abs(ty-y)+sp>.002)?requestAnimationFrame(tick):0;
    };
    if(fine&&!reduce)addEventListener('pointermove',e=>{
      tx=e.clientX/innerWidth;ty=e.clientY/innerHeight;
      if(lx!==null)ts=Math.min(1,ts+Math.hypot(e.clientX-lx,e.clientY-ly)/400);lx=e.clientX;ly=e.clientY;
      if(!raf)raf=requestAnimationFrame(tick);
    },{passive:true});
    tick();
  }

  /* 5) микроблики: редкие по всему сайту и плотные у диско-шаров */
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const glint=(host,place,o={})=>{
    const g=document.createElement('i');g.className='glint';
    const set=()=>{const [px,py]=place();g.style.left=px;g.style.top=py;g.style.setProperty('--gs',rnd(o.min||6,o.max||14).toFixed(0)+'px');
      g.style.setProperty('--gd',rnd(o.dmin||2.6,o.dmax||4.4).toFixed(2)+'s');g.style.setProperty('--go',rnd(.55,1).toFixed(2));
      g.style.setProperty('--gc',Math.random()<.35?'255,176,136':'200,188,245')};
    set();g.style.setProperty('--gw',rnd(0,o.wait||4).toFixed(2)+'s');g.addEventListener('animationiteration',set);host.appendChild(g);return g};
  if(!reduce){
    // по всему сайту — немного, в случайных местах
    if(document.querySelector('.velvet')){const lay=document.createElement('div');lay.className='glints';document.body.appendChild(lay);
      for(let i=0;i<7;i++)glint(lay,()=>[rnd(4,96)+'%',rnd(8,94)+'%'],{min:5,max:11,dmin:3.4,dmax:5.6,wait:8})}
    // у шара на фото первого экрана заказчика
    const hb=document.querySelector('.hx-box img[src*="hero-hall-dark"]')?.parentElement;
    if(hb){const z=document.createElement('div');z.className='glz';z.style.cssText='left:76%;top:0;width:16%;height:30%';hb.appendChild(z);
      for(let i=0;i<9;i++)glint(z,()=>{const a=rnd(0,6.283),r=Math.sqrt(Math.random())*42;return[(50+Math.cos(a)*r)+'%',(48+Math.sin(a)*r*1.1)+'%']},{min:6,max:16,wait:3})}
    // у шара из анкет
    const ds=document.getElementById('disco');
    if(ds)for(let i=0;i<12;i++)glint(ds,()=>{const a=rnd(0,6.283),r=rnd(.2,.62);return[(50+Math.cos(a)*r*45)+'%',(50+Math.sin(a)*r*50)+'%']},{min:6,max:15,wait:4});
    // у шара в финале
    const fb=document.querySelector('.fin-ball');
    if(fb)for(let i=0;i<8;i++)glint(fb,()=>{const a=rnd(0,6.283),r=rnd(30,62);return[(50+Math.cos(a)*r)+'%',(60+Math.sin(a)*r*.9)+'%']},{min:6,max:14,wait:3});
  }
})();
