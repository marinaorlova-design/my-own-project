/* =========================================================
   MOYO scrollfx — общее для лендингов:
   1) фон меняется по скроллу: секции с data-bg="v" красят страницу в фиолетовый
   2) кабинет: карточки прилетают рубашкой вверх и переворачиваются
   3) текстовые перебивки .tx: заголовки сменяют друг друга переворотом
   4) футер: часы Москвы и лаймовая точка в «О», которая тянется к курсору
   ========================================================= */
(()=>{
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const root=document.documentElement;
  const secs=$$('main > section, body > footer');

  /* ---------- 3) текстовые перебивки ---------- */
  const txs=$$('.tx').map(sec=>{
    const fr=[...sec.querySelectorAll('.tx-f')];
    // каждое слово — отдельный span; слова внутри <em> — ключевые (лайм)
    fr.forEach(f=>{
      const out=[];
      f.childNodes.forEach(n=>{
        if(n.nodeType===3)n.textContent.split(/ +/).forEach(w=>{if(!w.trim())return;
          // знак препинания прилипает к предыдущему слову, без пробела
          if(/^[,.!?:;]/.test(w)&&out.length&&out[out.length-1]!=='<br>'){out[out.length-1]=out[out.length-1].replace(/<\/span>$/,w+'</span>');return}
          out.push(`<span class="w">${w}</span>`)});
        else if(n.tagName==='BR')out.push('<br>');
        else n.textContent.split(/ +/).forEach(w=>w.trim()&&out.push(`<span class="w k">${w}</span>`));
      });
      f.innerHTML=out.join(' ');
    });
    const bars=[...sec.querySelectorAll('.tx-bar b')],num=sec.querySelector('.tx-n b'),cta=sec.querySelector('.tx-cta');
    return{sec,fr,ws:fr.map(f=>[...f.querySelectorAll('.w')]),bars,num,cta};
  });
  function updTx(){
    txs.forEach(({sec,fr,ws,bars,num,cta})=>{
      const r=sec.getBoundingClientRect(),p=clamp(-r.top/(r.height-innerHeight),0,1);
      const N=fr.length,s=clamp((p-.03)/.9,0,1)*N; // позиция в кадрах: 0…N
      let cur=0;
      fr.forEach((f,i)=>{
        const u=s-i;
        // вход: переворот снизу; выход: переворот вверх (у последнего выхода нет)
        const inn=i===0?1:ease(clamp((u+.16)/.16,0,1)),out=i===N-1?0:ease(clamp((u-.84)/.16,0,1));
        const vis=inn>0&&out<1;
        f.style.opacity=vis?Math.pow(inn,2)*Math.pow(1-out,2):0;
        f.style.transform=`translateY(-50%) rotateX(${(1-inn)*-90+out*90}deg)`;
        if(u>=-.16&&u<.84)cur=i;
        // слова проявляются по очереди в первой половине кадра
        const W=ws[i].length;
        ws[i].forEach((w,k)=>w.classList.toggle('on',u>.02+.5*k/W));
        bars[i]&&(bars[i].style.transform=`scaleX(${clamp(u/.84,0,1)})`);
      });
      num&&(num.textContent=String(cur+1).padStart(2,'0'));
      cta&&cta.classList.toggle('on',s>N-.45);
    });
  }

  /* ---------- кабинет: карточки по одной, переворот рубашка → лицо ---------- */
  const cab=$('.cab');let updCab=()=>{};
  if(cab){
    const head=$('#cabHead'),cc=[...cab.querySelectorAll('.cc')],dots=[...cab.querySelectorAll('#cabDots i')],N=cc.length;
    const A=i=>.15+i*(.74/N),D=.14,shown=cc.map(()=>0);
    updCab=()=>{
      const r=cab.getBoundingClientRect(),p=clamp(-r.top/(r.height-innerHeight),0,1),vh=innerHeight;
      // заголовок сначала по центру, затем уходит наверх и уменьшается
      const tt=ease(clamp((p-.03)/.12,0,1)),hh=head.offsetHeight;
      head.style.transform=`translateY(${(vh-hh)*.3*(1-tt)+84*tt}px) scale(${1-tt*.52})`;
      let act=-1;
      cc.forEach((c,i)=>{
        const e=clamp((p-A(i))/D,0,1),k=ease(e),f=ease(clamp((e-.2)/.8,0,1));
        const l=i<N-1?ease(clamp((p-A(i+1))/D,0,1)):0,gone=i<N-2?clamp((p-A(i+2))/D,0,1):0;
        const side=i%2?1:-1;
        const o=e<=0?0:Math.min(1,e*4)*(1-l*.7)*(1-gone);c.style.setProperty('--o',o);c.style.visibility=o>0?'visible':'hidden';
        c.style.transform=`translateY(${(1-k)*vh*.85-l*70}px) translateZ(${-l*260}px) rotateX(${(1-k)*22}deg) rotateZ(${(1-k)*7*side}deg) rotateY(${(1-f)*180*side}deg)`;
        if(e>.5)act=i;
        // лицо открылось — запускаем анимацию экрана внутри
        const on=f>.92&&l<.5?1:0;
        if(on!==shown[i]){shown[i]=on;const sc=c.querySelector('.scr');sc.classList.remove('on');if(on){void sc.offsetWidth;sc.classList.add('on')}}
      });
      dots.forEach((d,i)=>d.classList.toggle('on',i===act));
    };
  }

  /* ---------- три шага: кольцо карточек ---------- */
  // точечные цифры 5×7
  const FONT={0:'01110100011001110101110011000101110',1:'00100011000010000100001000010001110',2:'01110100010000100010001000100011111',3:'11111000100010000010000011000101110',4:'00010001100101010010111110001000010',5:'11111100001111000001000011000101110',6:'00110010001000011110100011000101110',7:'11111000010001000100010000100001000',8:'01110100011000101110100011000101110',9:'01110100011000101111000010001001100'};
  $$('.rk [data-led]').forEach(el=>{el.classList.add('led');let k=0;el.innerHTML=[...el.dataset.led].map(c=>`<span class="dg">${[...(FONT[c]||'0'.repeat(35))].map(b=>`<i style="--k:${k++}"${b==='1'?' class="on"':''}></i>`).join('')}</span>`).join('')});
  $$('.rk [data-bars]').forEach(el=>{el.classList.add('bars');el.innerHTML=el.dataset.bars.split(',').map((v,c)=>`<span style="--k:${c}">${Array.from({length:12},(_,k)=>`<i${k<+v?' class="on"':''}></i>`).join('')}</span>`).join('')});
  $$('.rk [data-ring]').forEach(el=>{const v=+el.dataset.ring,C=2*Math.PI*56;el.classList.add('ring');
    el.innerHTML=`<svg viewBox="0 0 132 132"><circle class="tr" cx="66" cy="66" r="56"/><circle class="fg" cx="66" cy="66" r="56" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-v/100)}" style="--C:${C};--O:${C*(1-v/100)}"/></svg><b>${el.dataset.label||v+'%'}</b>${el.dataset.sub?`<small>${el.dataset.sub}</small>`:''}`});
  $$('.rk [data-tl]').forEach(el=>{const[n,on]=el.dataset.tl.split(',').map(Number);el.classList.add('tl');el.innerHTML=Array.from({length:n},(_,k)=>`<i style="--k:${k}"${k===on?' class="on"':''}></i>`).join('')});
  const rgs=$('.rgs');let updRing=()=>{};
  if(rgs){
    /* кольцо по механике red-ring:
       5 карточек повторяются трижды; медленное «дышащее» вращение;
       тянешь — поворачивается с инерцией, потом доводится до ближайшей карточки,
       пауза 2,4 с и снова вращение; боковые карточки уходят в дымку;
       кольцо наклоняется за курсором; карточка под курсором выдвигается с бликом;
       при смене передней карточки — тихий «тик» (после первого касания) */
    const ring=rgs.querySelector('.rgs-stage'),arc=rgs.querySelector('.rg'),src=[...arc.children];
    src.forEach(c=>c.remove());
    const COPIES=3,cards=[];
    for(let k=0;k<COPIES;k++)src.forEach(c=>{const n=c.cloneNode(true);arc.appendChild(n);cards.push(n)});
    const N=cards.length,A=360/N,CW=256,GAP=30,R=Math.round((CW+GAP)/(2*Math.sin(Math.PI/N)));
    const CLEAR=46,HAZE=12,TILT=-4,SPEED=2.2,BREATH=.2;
    const lift=new Array(N).fill(0);
    let rot=0,vel=0,last=0,visible=true,snapTo=null,resumeAt=0,released=false,front=-1,hover=-1,audio=null;
    const drag={on:false,x:0},par={tx:0,ty:0,x:0,y:0};
    const nearest=()=>{let b=0,m=999;for(let i=0;i<N;i++){let s=((rot+i*A)%360+360)%360;const d=s>180?360-s:s;if(d<m){m=d;b=i}}return b};
    const tick=()=>{if(!audio)return;const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();
      o.type='sine';o.frequency.setValueAtTime(1900,t);o.frequency.exponentialRampToValueAtTime(1200,t+.04);
      g.gain.setValueAtTime(1e-4,t);g.gain.exponentialRampToValueAtTime(.045,t+.004);g.gain.exponentialRampToValueAtTime(1e-4,t+.06);
      o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.07)};
    const draw=()=>{
      const r=rot+par.x;
      arc.style.transform=`translateZ(${-R}px) rotateX(${TILT+par.y}deg) rotateY(${r}deg)`;
      cards.forEach((c,i)=>{
        let s=((r+i*A)%360+360)%360;const d=s>180?360-s:s;
        if(d>92){c.style.visibility='hidden';return}
        c.style.visibility='visible';
        const m=clamp((d-CLEAR)/(92-CLEAR),0,1),b=m*m*(3-2*m);
        c.style.opacity=String(1-b*b*.98);
        c.style.filter=b>.02?`blur(${Math.round(b*HAZE)}px)`:'none';
        const live=b<.02;
        if(live!==c.classList.contains('live')){c.classList.toggle('live',live)}
        c.style.transform=`rotateY(${i*A}deg) translateZ(${R-b*50+lift[i]}px)`;
      });
    };
    new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)last=0}).observe(ring);
    (function loop(now){
      if(visible){
        const dt=last?Math.min((now-last)/1000,.1):0;last=now;
        if(!drag.on){
          if(Math.abs(vel)>(released?18:.5)){rot+=vel*dt;vel*=.94}
          else if(released){released=false;const i=nearest();let s=((rot+i*A)%360+360)%360;if(s>180)s-=360;snapTo=rot-s}
          else if(snapTo!==null){const d=snapTo-rot;rot+=d*Math.min(1,dt*7);if(Math.abs(d)<.03){rot=snapTo;snapTo=null;resumeAt=now+2400}}
          else if(now>resumeAt)rot+=SPEED*(1+Math.sin(now/2600)*BREATH)*dt;
        }
        par.x+=(par.tx-par.x)*Math.min(1,dt*5);par.y+=(par.ty-par.y)*Math.min(1,dt*5);
        for(let i=0;i<N;i++){const t=i===hover&&!drag.on?30:0;lift[i]+=(t-lift[i])*Math.min(1,dt*9)}
        const f=nearest();if(f!==front){if(front>=0)tick();front=f}
        draw();
      }
      requestAnimationFrame(loop);
    })(performance.now());
    ring.addEventListener('pointerdown',e=>{ring.setPointerCapture(e.pointerId);drag.on=true;drag.x=e.clientX;vel=0;snapTo=null;released=true;ring.classList.add('drag');
      if(!audio)try{audio=new AudioContext}catch(_){audio=null}
      if(audio&&audio.state==='suspended')audio.resume()});
    ring.addEventListener('pointermove',e=>{
      if(drag.on){const d=(e.clientX-drag.x)*.2;drag.x=e.clientX;rot+=d;vel=d*60}
      const b=rgs.getBoundingClientRect();par.tx=((e.clientX-b.left)/b.width-.5)*-12;par.ty=((e.clientY-b.top)/b.height-.5)*5;
      const c=e.target.closest('.rk'),i=c?cards.indexOf(c):-1;
      if(i!==hover){cards[hover]&&cards[hover].classList.remove('is-hover');hover=i;c&&c.classList.add('is-hover')}
      if(c){const m=c.getBoundingClientRect();c.style.setProperty('--gx',(e.clientX-m.left)/m.width*100+'%');c.style.setProperty('--gy',(e.clientY-m.top)/m.height*100+'%')}
    });
    const up=e=>{try{ring.releasePointerCapture(e.pointerId)}catch(_){}drag.on=false;ring.classList.remove('drag')};
    ring.addEventListener('pointerup',up);ring.addEventListener('pointercancel',up);
    ring.addEventListener('pointerleave',()=>{par.tx=par.ty=0;cards[hover]&&cards[hover].classList.remove('is-hover');hover=-1});
    draw();
  }

  /* ---------- финал: занавес расходится, опускается диско-шар ---------- */
  const fin=$('.fin');let updFin=()=>{};
  if(fin){
    const L=fin.querySelector('.cur.l'),Rc=fin.querySelector('.cur.r'),ball=fin.querySelector('.fin-ball'),mic=fin.querySelector('.fin-mic'),inn=fin.querySelector('.fin-in'),stage=fin.querySelector('.fin-stage'),hint=fin.querySelector('.fin-hint');
    // блики вокруг шара и зайчики по сцене
    const bw=ball.querySelector('img');
    for(let i=0;i<14;i++){const g=document.createElement('i');g.className='gl';const a=Math.random()*Math.PI*2,r=.3+Math.random()*.2;
      g.style.left=(50+Math.cos(a)*r*100)+'%';g.style.top=(58+Math.sin(a)*r*90)+'%';g.style.animationDelay=(-Math.random()*2.4)+'s';
      g.innerHTML=`<svg viewBox="-10 -10 20 20" width="16" height="16"><path d="M0-9 1.6-1.6 9 0 1.6 1.6 0 9-1.6 1.6-9 0-1.6-1.6Z" fill="${i%3?'#fff':'#C6F35E'}"/></svg>`;ball.appendChild(g)}
    const sp=fin.querySelector('.fin-spots');
    for(let i=0;i<22;i++){const s=document.createElement('i');s.style.left=Math.random()*100+'%';s.style.top=Math.random()*90+'%';
      s.style.setProperty('--dx',(Math.random()*300-150)+'px');s.style.setProperty('--dy',(Math.random()*120-60)+'px');
      s.style.animationDelay=(-Math.random()*5)+'s';s.style.animationDuration=(4+Math.random()*3)+'s';const z=8+Math.random()*22;s.style.width=s.style.height=z+'px';sp.appendChild(s)}
    updFin=()=>{
      const r=fin.getBoundingClientRect(),p=clamp(-r.top/(r.height-innerHeight),0,1);
      const o=ease(clamp((p-.04)/.5,0,1));
      L.style.transform=`translateX(${-o*102}%)`;Rc.style.transform=`translateX(${o*102}%)`;
      ball.style.transform=`translateY(${-240+o*330}px)`;
      stage.style.transform=`scale(${1.12-o*.12})`;
      const t=ease(clamp((p-.42)/.2,0,1));
      inn.style.opacity=t;inn.style.transform=`translateY(${(1-t)*30}px)`;
      mic.style.opacity=ease(clamp((p-.3)/.2,0,1));
      hint&&(hint.style.opacity=1-clamp(p/.08,0,1));
      fin.style.setProperty('--fin-top',1-clamp(p/.12,0,1)*.6);
    };
  }

  /* ---------- 1) фон + общий цикл ---------- */
  // фон плавно перетекает: доля фиолетовых секций в окне вокруг центра экрана
  const DARK=[7,6,10],VIO=[47,24,112];
  function vMix(){
    const w=innerHeight*.55,c=innerHeight*.5,a=c-w,b=c+w;let v=0;
    secs.forEach(el=>{if(el.dataset.bg!=='v')return;const r=el.getBoundingClientRect();v+=Math.max(0,Math.min(b,r.bottom)-Math.max(a,r.top))});
    const t=clamp(v/(b-a),0,1);return t*t*(3-2*t);
  }
  function onScroll(){
    const t=vMix();
    const bgc=`rgb(${DARK.map((d,i)=>Math.round(d+(VIO[i]-d)*t)).join(',')})`;root.style.backgroundColor=bgc;root.style.setProperty('--pagebg',bgc);
    root.classList.toggle('v',t>.5);
    updTx();updCab();updRing();updFin();
  }
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',onScroll);
  addEventListener('load',onScroll);
  onScroll();

  /* ---------- 4) футер ---------- */
  const mark=$('#ftMark'),pupil=$('#ftPupil');
  if(mark){
    new IntersectionObserver(es=>es[0].isIntersecting&&mark.classList.add('in'),{threshold:.3}).observe(mark);
    let tx=0,ty=0,x=0,y=0;
    addEventListener('pointermove',e=>{
      const r=pupil.parentElement.getBoundingClientRect(),cx=r.left+r.width*.4034,cy=r.top+r.height*.5;
      const dx=e.clientX-cx,dy=e.clientY-cy,d=Math.hypot(dx,dy)||1,k=Math.min(1,d/500)*58;
      tx=dx/d*k;ty=dy/d*k*.9;
    });
    (function t(){x+=(tx-x)*.08;y+=(ty-y)*.08;pupil.style.translate=`${x}px ${y}px`;requestAnimationFrame(t)})();
  }
  const clk=$('#ftClock');
  if(clk){const tick=()=>{const d=new Date(new Date().toLocaleString('en-US',{timeZone:'Europe/Moscow'}));clk.innerHTML=`${String(d.getHours()).padStart(2,'0')}<i>:</i>${String(d.getMinutes()).padStart(2,'0')}`};tick();setInterval(tick,10000)}
})();
