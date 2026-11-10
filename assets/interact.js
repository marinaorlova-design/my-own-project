/* =========================================================
   MOYO interact — всё, что можно потрогать руками:
   1) кабинет: отклики, приглашения, календарь, чаты в стиле iMessage
   2) вопросы: ответ печатает менеджер, как в мессенджере
   3) заказчик: после анимации на первом экране можно описать своё событие
   Подключается после основного скрипта страницы (нужны PEOPLE и photo).
   ========================================================= */
(()=>{
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const role=document.body.dataset.role;
  const IMG=n=>`assets/img/${n}.jpg`;
  const esc=t=>String(t).replace(/</g,'&lt;');
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));

  /* ---------- общее: всплывашка внутри карточки ---------- */
  function toast(scr,html){
    let t=scr.querySelector('.ctoast');
    if(!t){t=document.createElement('div');t.className='ctoast';scr.appendChild(t)}
    t.innerHTML=html;t.classList.remove('on');void t.offsetWidth;t.classList.add('on');
    clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),2600);
  }

  /* ---------- календарь: клик по дню раскрывает событие ---------- */
  const EVENTS=role==='zakazchik'?{
    20:{img:'e-birthday-loft',t:'День рождения',w:'20 мая · 19:00 · лофт на&nbsp;Курской',d:['Команда 3 из&nbsp;3: ведущий, диджей, вокал','90&nbsp;000&nbsp;₽ у&nbsp;платформы до&nbsp;конца события']},
    24:{img:'e-graduation',t:'Выпускной',w:'24 мая · 18:00 · банкетный зал',d:['Команда 4 из&nbsp;4','Договор подписан, оплата под&nbsp;защитой']},
    31:{img:'e-corporate-it',t:'Корпоратив',w:'31 мая · 20:00 · ресторан',d:['Команда 2 из&nbsp;3, AI подбирает вокал','Оплата после того, как соберёшь команду']}
  }:{
    12:{img:'e-jubilee',t:'Юбилей',w:'12 декабря · 18:00 · ресторан',d:['2 сета по&nbsp;45&nbsp;минут','40&nbsp;000&nbsp;₽ у&nbsp;платформы до&nbsp;события']},
    19:{img:'e-wedding',t:'Открытие ресторана',w:'19 декабря · 20:00 · Патриаршие',d:['Джаз-сет, 3 часа','35&nbsp;000&nbsp;₽ у&nbsp;платформы до&nbsp;события']},
    26:{img:'e-corporate-it',t:'Корпоратив IT-компании',w:'26 декабря · 20:00 · лофт',d:['2 сета, 300 гостей','60&nbsp;000&nbsp;₽ у&nbsp;платформы до&nbsp;события']},
    31:{img:'e-graduation',t:'Новогодняя ночь',w:'31 декабря · 22:00 · банкетный зал',d:['Программа до&nbsp;3:00','90&nbsp;000&nbsp;₽ · договор подписан']}
  };
  function evPop(scr,day){
    const e=EVENTS[day];if(!e)return;
    let p=scr.querySelector('.evpop');
    if(!p){p=document.createElement('div');p.className='evpop';scr.appendChild(p);p.addEventListener('click',ev=>{if(ev.target.closest('.x')||ev.target===p)p.classList.remove('on')})}
    p.innerHTML=`<div class="box"><button class="x" aria-label="Закрыть">×</button><img src="${IMG(e.img)}" alt=""><div class="in"><b>${e.t}</b><small>${e.w}</small>${e.d.map(x=>`<span>● ${x}</span>`).join('')}</div></div>`;
    p.classList.add('on');
  }
  $$('.cgrid').forEach(g=>{
    const scr=g.closest('.scr');
    g.addEventListener('click',ev=>{
      const d=ev.target.closest('.d');if(!d||d.classList.contains('e')||d.classList.contains('dn'))return;
      const n=parseInt(d.textContent);
      if(d.classList.contains('b'))return evPop(scr,n);
      // свободный день: отметить занятым и обратно
      d.classList.toggle('busy');
      toast(scr,d.classList.contains('busy')?`${n}-е отмечено как занятое`:`${n}-е снова свободно`);
    });
    // ближайшие события справа тоже открываются
    scr.querySelectorAll('.upc div:not(.lbl)').forEach(u=>{u.style.cursor='pointer';u.addEventListener('click',()=>evPop(scr,parseInt(u.querySelector('b').textContent)))});
  });

  /* ---------- чаты в стиле iMessage ---------- */
  function bubble(chat,side,text){
    const m=document.createElement('div');m.className=`msg ${side} add`;m.innerHTML=text;chat.appendChild(m);chat.scrollTop=1e5;return m;
  }
  async function typing(chat){
    const t=document.createElement('div');t.className='msg l add typing';t.innerHTML='<i></i><i></i><i></i>';chat.appendChild(t);chat.scrollTop=1e5;
    await sleep(1100);t.remove();
  }
  function quick(scr,chat,list){
    const q=document.createElement('div');q.className='qrep';
    q.innerHTML=list.map(([a])=>`<button type="button">${a}</button>`).join('');
    scr.appendChild(q);
    q.addEventListener('click',async ev=>{
      const b=ev.target.closest('button');if(!b||q.dataset.busy)return;
      const it=list.find(x=>x[0]===b.textContent);q.dataset.busy=1;b.disabled=true;
      bubble(chat,'r',it[0]);await sleep(400);await typing(chat);bubble(chat,'l',it[1]);delete q.dataset.busy;
    });
  }
  if(role==='ispolnitel'){
    // чат проекта: шапка с собеседником и быстрые ответы
    const chat=$('.scr[data-s="3"] .chat'),scr=chat&&chat.closest('.scr');
    if(chat){
      scr.classList.add('imsg');
      scr.querySelector('h4').outerHTML=`<div class="im-h"><img src="${IMG('c-org-1')}" alt=""><div><b>Ирина Соколова</b><small>HR · Корпоратив IT-компании, 26 декабря</small></div></div>`;
      scr.querySelector('.sub')&&scr.querySelector('.sub').remove();
      chat.querySelectorAll('.msg small').forEach(s=>s.remove());
      quick(scr,chat,[['Подтверждаю 👍','Спасибо! Тогда ждём вас к&nbsp;19:30 на&nbsp;саундчек'],['Пришлю сет-лист','Отлично, покажу его руководителю'],['Какой дресс-код?','Black tie: у&nbsp;гостей вечерние наряды ✨']]);
    }
    // вакансии: обложки и рабочие кнопки
    const vacs=$$('.scr[data-s="0"] .vac'),covers=['e-corporate-it','e-jubilee','e-wedding','e-graduation'];
    vacs.forEach((v,i)=>{v.insertAdjacentHTML('afterbegin',`<img class="vth" src="${IMG(covers[i%4])}" alt="">`);
      const g=v.querySelector('.go');if(!g||g.classList.contains('first'))return;
      g.addEventListener('click',()=>{if(g.classList.contains('sent'))return;g.classList.add('sent');g.textContent='Отклик отправлен ✓';toast(v.closest('.scr'),'Отклик отправлен. Заказчик увидит анкету сегодня')});
    });
        // приглашение: обложка и кнопки
    const inv=$('.scr[data-s="1"] .invite');
    if(inv){
      inv.insertAdjacentHTML('afterbegin',`<img class="ivth" src="${IMG('e-wedding')}" alt="">`);
      const [acc,talk]=inv.querySelectorAll('.bt span');
      acc.addEventListener('click',()=>{inv.classList.add('done');inv.querySelector('.bt').innerHTML='<span class="ok">✓ Добавлено в&nbsp;календарь · 14&nbsp;июня</span>'});
      talk.addEventListener('click',()=>toast(inv.closest('.scr'),'Открыли чат с&nbsp;организатором'));
    }
  }
  if(role==='zakazchik'){
    const scr=$('.scr[data-s="2"]'),chat=scr&&scr.querySelector('.chat'),list=scr&&scr.querySelector('.chl');
    if(chat){
      scr.classList.add('imsg');
      chat.querySelectorAll('.msg small').forEach(s=>s.remove());
      const CONV={
        'Марк Ветров':chat.innerHTML,
        'DJ Nova':'<div class="msg l">Свободна 20&nbsp;мая! Могу привезти свой свет</div><div class="msg r">Супер, добавляю в&nbsp;команду</div><div class="sys"><span class="ck">✓</span>Условия зафиксированы в&nbsp;договоре</div>',
        'Алина Север':'<div class="msg l">Райдер в&nbsp;проекте: нужна стойка и&nbsp;два монитора</div><div class="msg r">Площадка всё обеспечит 👌</div>',
        'Кавер-бэнд «Ритм»':'<div class="msg r">Спасибо за&nbsp;вечер, гости в&nbsp;восторге!</div><div class="msg l">Спасибо вам! Будем рады снова 🙌</div>'
      };
      list.addEventListener('click',ev=>{
        const it=ev.target.closest('.chl>div');if(!it)return;
        const name=it.querySelector('b').textContent;
        list.querySelectorAll(':scope>div').forEach(x=>x.classList.toggle('on',x===it));
        const em=it.querySelector('em');em&&em.remove();
        chat.innerHTML=CONV[name]||'';chat.querySelectorAll('.msg,.sys').forEach(m=>m.classList.add('add'));
      });
      quick(scr,chat,[['Когда созвонимся?','Могу сегодня после 18:00, наберу в&nbsp;чате'],['Пришлите программу','Уже отправил в&nbsp;проект, посмотрите 🙌'],['Всё подтверждаю ✓','Спасибо! Увидимся 20&nbsp;мая']]);
    }
    // подбор: клик по карточке — в команду / из команды
    const s0=$('.scr[data-s="0"]');
    if(s0){
      s0.querySelector('.picks').addEventListener('click',ev=>{
        const p=ev.target.closest('.pick');if(!p)return;p.classList.toggle('mine');
        const n=s0.querySelectorAll('.pick.mine').length,lab=p.querySelector('div');
        toast(s0,p.classList.contains('mine')?`${p.querySelector('b').textContent} в&nbsp;команде · всего ${n}`:`${p.querySelector('b').textContent} убран из&nbsp;команды`);
      });
      const bts=s0.querySelectorAll('.invite .bt span');
      bts[0]&&bts[0].addEventListener('click',()=>{s0.querySelector('.invite .bt').innerHTML='<span class="ok">✓ Приглашения отправлены</span>'});
      bts[1]&&bts[1].addEventListener('click',()=>toast(s0,'Нажми на&nbsp;исполнителя, чтобы добавить или убрать'));
    }
    // анкеты: сердечко и открытие портфолио
    const pf=$('#pfGrid');
    pf&&pf.addEventListener('click',ev=>{
      const h=ev.target.closest('.hrt');
      if(h){h.classList.toggle('on');h.textContent=h.classList.contains('on')?'♥':'♡';return}
      const c=ev.target.closest('.pf');if(!c)return;
      const i=typeof PEOPLE!=='undefined'?PEOPLE.findIndex(p=>p[0]===c.querySelector('b').textContent):-1;
      if(i>=0&&typeof openModal==='function')openModal(i);
      else toast(c.closest('.scr'),'Портфолио откроется после регистрации');
    });
  }

  // фильтры-чипы во всех экранах кабинета переключаются (pfchips)
  $$('.cc-front .chips').forEach(ch=>ch.addEventListener('click',ev=>{const c=ev.target.closest('span');if(!c)return;
    if(ch.closest('.scr[data-s="1"]')&&role==='zakazchik'){ch.querySelectorAll('span').forEach(x=>x.classList.toggle('a',x===c))}else c.classList.toggle('a')}));
  // исполнитель: в подборе отмечена твоя анкета
  if(role==='ispolnitel'){const pk=$('.scr[data-s="1"] .picks');pk&&pk.addEventListener('click',ev=>{const p=ev.target.closest('.pick');if(!p)return;
    toast(p.closest('.scr'),p.classList.contains('mine')?'Это твоя анкета: AI поставил её в&nbsp;подборку':'Коллега тоже в&nbsp;подборке. Выигрывает лучшее портфолио')})}

  /* ---------- вопросы: менеджер печатает ответ ---------- */
  const faq=$('#faqList');
  if(faq){
    faq.querySelectorAll('.qa').forEach(q=>{
      const a=q.querySelector('.a>div'),p=a.querySelector('p');
      const html=p.innerHTML;
      a.innerHTML=`<div class="fq"><img src="${IMG('manager')}" alt="Анастасия"><div><small>Анастасия · менеджер MOYO</small><div class="fb"></div></div></div>`;
      q._html=html;q._done=false;
    });
    async function play(q){
      if(q._done||q._run)return;q._run=true;
      const fb=q.querySelector('.fb'),tmp=document.createElement('div');tmp.innerHTML=q._html;const txt=tmp.textContent;
      fb.textContent='';q.querySelector('small').textContent='Анастасия печатает…';
      await sleep(250);
      for(let i=0;i<=txt.length;i+=2){fb.textContent=txt.slice(0,i);await sleep(14)}
      fb.innerHTML=q._html;q.querySelector('small').textContent='Анастасия · менеджер MOYO';
      q._done=true;q._run=false;
    }
    faq.addEventListener('click',ev=>{const b=ev.target.closest('.qa>button');if(!b)return;const q=b.parentElement;setTimeout(()=>q.classList.contains('on')&&play(q),60)});
    new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){const q=faq.querySelector('.qa.on');q&&play(q);o.disconnect()}},{threshold:.4}).observe(faq);
  }

  /* ---------- заказчик: живой ввод на первом экране ---------- */
  const ask=$('.ask');
  if(ask&&role==='zakazchik'&&typeof PEOPLE!=='undefined'){
    const ROLES=[
      [/ведущ|тамад|конферанс/,'Ведущий'],[/диджей|dj|ди-джей/,'Диджей'],[/вокал|певиц|певец|спеть|джаз/,'Вокал'],
      [/танц|балет|шоу-балет/,'Шоу'],[/кавер|групп|бэнд|band/,'Кавер'],[/фокус|иллюзион/,'Иллюзионист'],
      [/саксоф|скрип|музыкант|инструмент/,'Музыкант'],[/битбокс/,'Битбокс'],[/сил|атлет/,'Силовое шоу']
    ];
    const POOL={'Ведущий':['Марк Ветров','Илья Громов'],'Диджей':['DJ Nova','Даня Бит'],'Вокал':['Алина Север','Ева Ли'],'Шоу':['Spark Crew','Ника Рэй'],'Кавер':['Jazz Ritm'],'Иллюзионист':['Олег Март'],'Музыкант':['Лев Мирон'],'Битбокс':['Даня Бит'],'Силовое шоу':['Макс Спарк']};
    const tx=$('#askTx'),send=$('#askSend'),ai=$('#aiLine'),aiTx=$('#aiTx'),lab=ask.querySelector('.label');
    let live=false;
    function goLive(){
      if(live)return;live=true;
      const ta=document.createElement('textarea');ta.className='tx live';ta.rows=2;ta.placeholder='Например: свадьба на 80 гостей, 14 июня, нужны ведущий и кавер-группа';
      ta.value='';tx.replaceWith(ta);ask.classList.add('live');
      lab&&(lab.textContent='Теперь попробуй сам: опиши своё событие');
      ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();run(ta.value)}});
      send.addEventListener('click',()=>run(ta.value));
    }
    async function run(q){
      q=q.trim();if(!q)return;const lq=q.toLowerCase();
      let need=ROLES.filter(([r])=>r.test(lq)).map(x=>x[1]);
      ['Ведущий','Диджей','Вокал'].forEach(d=>{if(need.length<3&&!need.includes(d))need.push(d)});
      need=need.slice(0,3);
      const guests=(lq.match(/(\d+)\s*(гост|человек|чел)/)||[])[1],date=(lq.match(/\d{1,2}\s+(январ|феврал|март|апрел|ма[яй]|июн|июл|август|сентябр|октябр|ноябр|декабр)\S*/)||[])[0];
      ai.classList.add('on');ai.classList.remove('done');
      const lit=$('#hxLit');lit&&(lit.style.transition='opacity .8s',lit.style.opacity=.15);
      aiTx.textContent='AI уточняет детали: дата, гости, площадка…';await sleep(900);
      aiTx.textContent='Ищу свободных исполнителей'+(date?` на ${date}`:'')+'…';await sleep(900);
      const used=new Set(),cards=$$('#team .tm');
      need.forEach((r,i)=>{
        const name=(POOL[r]||[]).find(n=>!used.has(n))||PEOPLE[i][0];used.add(name);
        const p=PEOPLE.find(x=>x[0]===name)||PEOPLE[i],price=(p[7]&&p[7][0]&&p[7][0][1])||'от 25 000 ₽',mt=90+Math.floor(Math.random()*8);
        const c=cards[i];if(!c)return;
        c.querySelector('.mt').textContent=`мэтч ${mt}%`;
        c.querySelector('.ph').innerHTML=photo(0,0,'sing',name);
        c.querySelector('.in').innerHTML=`<b>${esc(name)} <span class="acc">✓</span></b><small>${esc(p[1])}</small><span class="pr">${esc(price)}</span>`;
        c.classList.remove('snap');void c.offsetWidth;c.classList.add('snap');
      });
      ai.classList.add('done');lit&&(lit.style.opacity=1);typeof confetti==='function'&&confetti();
      aiTx.textContent='Подобрала команду'+(guests?` на ${guests} гостей`:'')+(date?`, ${date}`:'')+'. Нажми «Собрать команду», чтобы пригласить';
    }
    // включаем живой ввод, когда показательная анимация закончилась
    setTimeout(goLive,7600);
  }
})();
