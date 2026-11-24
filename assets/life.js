/* MOYO — «мелкая жизнь»: магнитные кнопки, счётчики цифр, компактная кнопка менеджера */
(()=>{
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine=matchMedia('(pointer: fine)').matches;

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
    // у шара на фото первого экрана заказчика
    const hb=document.querySelector('.hx-box img[src*="hero-hall-dark"]')?.parentElement;
    if(hb){const z=document.createElement('div');z.className='glz';z.style.cssText='left:76%;top:0;width:16%;height:30%';hb.appendChild(z);
      for(let i=0;i<9;i++)glint(z,()=>{const a=rnd(0,6.283),r=Math.sqrt(Math.random())*42;return[(50+Math.cos(a)*r)+'%',(48+Math.sin(a)*r*1.1)+'%']},{min:6,max:16,wait:3})}
    // у шара из анкет
    const ds=document.getElementById('disco');
    if(ds)for(let i=0;i<12;i++)glint(ds,()=>{const a=rnd(0,6.283),r=rnd(.2,.62);return[(50+Math.cos(a)*r*45)+'%',(50+Math.sin(a)*r*50)+'%']},{min:6,max:15,wait:4});
    // у 3D-иконок в карточках шагов
    document.querySelectorAll('.stc-ic').forEach(ic=>{const z=document.createElement('div');z.className='glz';ic.appendChild(z);
      for(let i=0;i<4;i++)glint(z,()=>[rnd(10,90)+'%',rnd(10,90)+'%'],{min:8,max:16,dmin:2.8,dmax:4.6,wait:4})});
    // у шара в финале
    const fb=document.querySelector('.fin-ball');
    if(fb)for(let i=0;i<8;i++)glint(fb,()=>{const a=rnd(0,6.283),r=rnd(30,62);return[(50+Math.cos(a)*r)+'%',(60+Math.sin(a)*r*.9)+'%']},{min:6,max:14,wait:3});
  }

  /* 6) плавное появление заголовков, текстов и карточек */
  if(!reduce&&'IntersectionObserver' in window){
    const sel='.stp-head h2,.stp-r .btn,.stc,.pp-head h2,.pp-head p,.pp-head .btn,.cab-head h2,.ref h2,.ref .lead,.r-grid>*,.ab-ph,.ab-tx h2,.ab-tx .lead,.ab-num>div,.faq h2,.faq .lead,.qa,.ft-top>*';
    const els=[...document.querySelectorAll(sel)].filter(el=>!el.closest('.hero,.fin,.tx'));
    const parents=new Map();
    els.forEach(el=>{const p=el.parentElement;const k=(parents.get(p)||0);parents.set(p,k+1);el.style.setProperty('--rd',Math.min(k,6)*.09+'s');el.classList.add('mrv')});
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('mrv-in');io.unobserve(e.target)}}),{threshold:.15,rootMargin:'0px 0px -8% 0px'});
    els.forEach(el=>io.observe(el));
  }

  /* 7) печатная машинка для подзаголовков с атрибутом data-type */
  const esc=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  document.querySelectorAll('[data-type]').forEach(el=>{
    if(reduce||el.children.length)return;
    const txt=el.textContent;el.innerHTML='<span style="opacity:0">'+esc(txt)+'</span>';
    const io=new IntersectionObserver(([e])=>{
      if(!e.isIntersecting)return;io.disconnect();
      let n=0;const step=()=>{n=Math.min(txt.length,n+2);
        el.innerHTML=esc(txt.slice(0,n))+'<i class="tw-c"></i><span style="opacity:0">'+esc(txt.slice(n))+'</span>';
        if(n<txt.length)setTimeout(step,22);else setTimeout(()=>{el.textContent=txt},900)};
      setTimeout(step,250);
    },{threshold:.6});io.observe(el);
  });
})();
