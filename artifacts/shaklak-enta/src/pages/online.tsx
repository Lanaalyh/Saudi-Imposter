import { useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowUpLeft, Copy, Link2, Send, UsersRound, ShieldQuestion, Check, RotateCcw } from 'lucide-react';
import { createRoom, joinRoom, useGetCategories, getGetCategoriesQueryKey, useGetRoom, getGetRoomQueryKey, startRound, submitClue, submitVote, sendMessage } from '@workspace/api-client-react';
import type { RoomState } from '@workspace/api-client-react';
import { Header, PageTitle, Action, PlayerList, SecretCard, EmptyNote, ErrorNote, BackLink, CrewAvatar, MissionTrack } from '../components/game-ui';
import { categoryName, localCategories } from '../game-data';

const sessionKey = 'shaklak-online-session';
function getSession(): { code: string; token: string } | null { try { return JSON.parse(sessionStorage.getItem(sessionKey) || 'null'); } catch { return null; } }
function saveSession(code: string, token: string) { sessionStorage.setItem(sessionKey, JSON.stringify({code,token})); }
function errorText(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  if (/network|fetch|connect|timeout|offline/i.test(message)) return 'تعذّر الاتصال بالمحطة. تأكد من الشبكة وحاول مرة ثانية.';
  if (/not found|invalid|expired|404/i.test(message)) return 'الرمز غير صحيح أو انتهت صلاحية الغرفة. تأكد منه وحاول مجدداً.';
  if (/full|capacity/i.test(message)) return 'الغرفة مكتملة العدد. اطلب من الربع فتح غرفة ثانية.';
  if (/already|duplicate/i.test(message)) return 'هالاسم مستخدم في الغرفة. جرّب اسماً مختلفاً.';
  return 'تعذّر إكمال المهمة الآن. حاول مرة ثانية.';
}

export function CreatePage() {
  const [, navigate] = useLocation();
  const categories = useGetCategories({query:{queryKey:getGetCategoriesQueryKey()}});
  const [name,setName] = useState('');
  const [category,setCategory] = useState('');
  const [pending,setPending] = useState(false);
  const [error,setError] = useState('');
  const choices = categories.data ?? [];
  const selected = category || choices[0]?.id || '';
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (!name.trim() || !selected) return;
    setPending(true); setError('');
    try { const response = await createRoom({name:name.trim(),category:selected}); saveSession(response.room.code,response.token); navigate(`/room/${response.room.code}`); }
    catch (caught) { setError(errorText(caught)); } finally { setPending(false); }
  }
  return <div className="app" dir="rtl"><Header/><main className="game-shell narrow"><BackLink/><PageTitle label="أنت المضيف" title="سوّ غرفة للربع" subtitle="اختار موضوعكم وخلّ الباقي علينا."/>
    <form className="panel" onSubmit={submit}><label className="field">وش نناديك؟<input data-testid="input-host-name" value={name} onChange={e=>setName(e.target.value)} maxLength={24} required placeholder="اكتب اسمك"/></label>
      <div style={{fontWeight:800}}>وش موضوع الجولة؟</div>
       {categories.isLoading ? <div><div className="skeleton"/><div className="skeleton"/><div className="skeleton"/></div> : categories.isError ? <ErrorNote message="ما قدرنا نجيب المواضيع." onRetry={()=>categories.refetch()}/> : choices.length === 0 ? <EmptyNote>ما فيه مواضيع متاحة الحين. جرّب بعد شوي.</EmptyNote> : <div className="select-grid">{choices.map(item=><button data-testid={`button-category-${item.id}`} type="button" className={`select-card ${selected===item.id?'selected':''}`} key={item.id} onClick={()=>setCategory(item.id)}><strong>{categoryName(item.id)}</strong><span>{localCategories.find(cat=>cat.id===item.id)?.description ?? 'ملف من أرشيف الديرة'}</span></button>)}</div>}
      {error && <ErrorNote message={error}/>}<Action type="submit" className="full" testId="button-create-room" disabled={pending || !selected || !name.trim()}>{pending?'نسوّي الغرفة...':'سوّ الغرفة'} <ArrowUpLeft size={19}/></Action>
    </form></main></div>;
}

export function JoinPage() {
  const [,navigate] = useLocation();
  const inviteCode = new URLSearchParams(window.location.search).get('code') || '';
  const [code,setCode] = useState(inviteCode.toUpperCase());
  const [name,setName] = useState('');
  const [pending,setPending] = useState(false);
  const [error,setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (!name.trim() || !code.trim()) return;
    setPending(true); setError('');
    try { const response=await joinRoom(code.trim().toUpperCase(),{name:name.trim()}); saveSession(response.room.code,response.token); navigate(`/room/${response.room.code}`); }
    catch(caught) { setError(errorText(caught)); } finally { setPending(false); }
  }
  return <div className="app" dir="rtl"><Header/><main className="game-shell narrow"><BackLink/><PageTitle label="مكانك محفوظ" title="ادخل على الربع" subtitle="عندك رمز الغرفة؟ باقي اسمك وتدخل."/><form className="panel" onSubmit={submit}>
     <label className="field">رمز الغرفة<input data-testid="input-room-code" value={code} onChange={e=>setCode(e.target.value.toUpperCase().replace(/\s/g,''))} placeholder="اكتب رمز الدعوة" dir="ltr" style={{textAlign:'center',letterSpacing:'.18em',fontWeight:800}} required/></label>
    <label className="field">وش نناديك؟<input data-testid="input-join-name" value={name} onChange={e=>setName(e.target.value)} maxLength={24} placeholder="اكتب اسمك" required/></label>
    {error&&<ErrorNote message={error}/>}<Action type="submit" className="full" testId="button-join-room" disabled={pending||!code.trim()||!name.trim()}>{pending?'ندخّلك...':'يلا ندخل'} <ArrowUpLeft size={19}/></Action>
   </form><p className="muted" style={{textAlign:'center',marginTop:30}}>ما عندك رمز؟ <Link href="/create" data-testid="link-create-from-join" style={{color:'#e9bc72',fontWeight:800}}>سوّ غرفة جديدة</Link></p></main></div>;
}

function ChatBox({room,code,token,onUpdate}:{room:RoomState;code:string;token:string;onUpdate:(value:RoomState)=>void}) {
  const [text,setText]=useState(''); const [pending,setPending]=useState(false); const [error,setError]=useState('');
  async function submit(event:React.FormEvent) { event.preventDefault(); if(!text.trim())return; setPending(true);setError('');
    try { const result=await sendMessage(code,{token,text:text.trim()});onUpdate(result);setText(''); } catch(caught){setError(errorText(caught));}finally{setPending(false);}
  }
  return <div className="panel chat"><h3>سوالف الغرفة</h3><div className="chat-messages" aria-live="polite">{room.messages.length ? room.messages.map(message=><div key={message.id} className={`chat-message ${message.playerId===room.selfId?'self':''}`} data-testid={`message-${message.id}`}><strong>{message.name}</strong>{message.text}</div>) : <EmptyNote>المجلس هادي... ابدأ السالفة!</EmptyNote>}</div>{error&&<ErrorNote message={error}/>}<form className="chat-form" onSubmit={submit}><input className="chat-input" data-testid="input-chat" value={text} onChange={e=>setText(e.target.value)} maxLength={250} placeholder="اكتب رسالة..." aria-label="رسالة"/><button data-testid="button-send-chat" type="submit" disabled={pending||!text.trim()} aria-label="أرسل الرسالة"><Send size={18}/></button></form></div>;
}

function RoomGame({room,code,token,onUpdate}:{room:RoomState;code:string;token:string;onUpdate:(value:RoomState)=>void}) {
  const [revealed,setRevealed]=useState(false);
  const [clue,setClue]=useState('');
  const [selectedVote,setSelectedVote]=useState('');
  const [pending,setPending]=useState(false);
  const [error,setError]=useState('');
  const [copied,setCopied]=useState('');
  const self=room.players.find(p=>p.id===room.selfId);
  async function run(action:()=>Promise<RoomState>) { setPending(true);setError('');try{onUpdate(await action());}catch(caught){setError(errorText(caught));}finally{setPending(false);} }
  async function copy(value:string,type:string){try{await navigator.clipboard.writeText(value);setCopied(type);window.setTimeout(()=>setCopied(''),2300);}catch{setError('ما قدرنا ننسخ. تقدر تحدد الرمز وتنسخه بنفسك.');}}
   return <div className="room-layout"><div className="room-main"><MissionTrack phase={room.phase}/><div className="room-banner"><div><small>رمز الغرفة · الجولة {room.round}</small><strong data-testid="text-room-code">{room.code}</strong></div><div className="room-actions"><Action kind="plain" className="tiny" testId="button-copy-code" onClick={()=>copy(room.code,'code')}>{copied==='code'?<Check size={15}/>:<Copy size={15}/>} {copied==='code'?'تم النسخ':'انسخ الرمز'}</Action><Action kind="plain" className="tiny" testId="button-copy-link" onClick={()=>copy(`${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/,'')}/join?code=${room.code}`,'link')}>{copied==='link'?<Check size={15}/>:<Link2 size={15}/>} {copied==='link'?'تم النسخ':'رابط الدعوة'}</Action></div></div>
    <div className="panel" style={{marginTop:20}}>
       {room.phase==='lobby' && <><div className="phase-label">الطاقم يتجمّع</div><h2>بانتظار اكتمال المهمة</h2><p className="muted">أرسل الرمز للربع. تحتاجون ٣ لاعبين على الأقل عشان تبدأ السالفة.</p><PlayerList players={room.players}/>{room.isHost ? <Action testId="button-start-round" className="full" disabled={pending||room.players.length<3} onClick={()=>run(()=>startRound(code,{token}))}>ابدأ الجولة <ArrowUpLeft size={18}/></Action> : <div className="alert">قائد المهمة بيبدأ الجولة لما يكتمل العدد.</div>}</>}
       {room.phase==='clues' && <><div className="phase-label">الجولة {room.round} · دور التلميحات</div><h2>الكلمة بينكم... تقريباً.</h2><p className="muted">كل شخص يعطي تلميح قصير. لا تقول الكلمة نفسها، ولا تعطِ تلميح واضح بزيادة.</p><SecretCard revealed={revealed} imposter={room.role==='imposter'} word={room.word??null} onToggle={()=>setRevealed(!revealed)}/>{!self?.hasClue ? <form onSubmit={e=>{e.preventDefault();if(clue.trim())run(()=>submitClue(code,{token,text:clue.trim()}));}}><label className="field">تلميحك<input data-testid="input-clue" value={clue} onChange={e=>setClue(e.target.value)} maxLength={80} placeholder="كلمة أو جملة قصيرة" required/></label><Action type="submit" className="full" testId="button-submit-clue" disabled={pending||!clue.trim()}>أرسل التلميح <ArrowUpLeft size={18}/></Action></form> : <div className="status-ribbon">تلميحك وصل! ننتظر الباقين.</div>}<h3 style={{marginTop:29}}>تلميحات الربع</h3>{room.clues.length ? <div className="clue-list">{room.clues.map((item,index)=><div className="clue-item" key={`${item.playerId}-${index}`}><strong>{item.name}</strong><p>{item.text}</p></div>)}</div> : <EmptyNote>ما أحد لمّح للحين... خلك أول واحد.</EmptyNote>}<p className="muted">بعد ما يلمّح الكل، يبدأ التصويت تلقائياً.</p></>}
       {room.phase==='voting' && <><div className="phase-label">الجولة {room.round} · وقت الاتهام</div><h2>مين المختلف فيكم؟</h2><p className="muted">اقرأ التلميحات وفكّر زين. صوتك ما ينرجع بعد الإرسال.</p><div className="clue-list">{room.clues.map((item,index)=><div className="clue-item" key={`${item.playerId}-${index}`}><strong>{item.name}</strong><p>{item.text}</p></div>)}</div>{!self?.hasVoted ? <><h3>اختر هوية واحدة للتحقيق</h3><div className="players">{room.players.filter(p=>p.id!==room.selfId).map((player,index)=><button type="button" className={`vote-choice ${selectedVote===player.id?'selected':''}`} data-testid={`button-select-vote-${player.id}`} key={player.id} onClick={()=>setSelectedVote(player.id)}><CrewAvatar name={player.name} index={index}/>{player.name}</button>)}</div><Action testId="button-submit-vote" className="full" disabled={!selectedVote||pending} onClick={()=>run(()=>submitVote(code,{token,playerId:selectedVote}))}>أكيد، هذا المختلف <ArrowUpLeft size={18}/></Action></> : <div className="status-ribbon">تم تسجيل صوتك. ننتظر بقية الربع.</div>}<p className="muted" style={{marginTop:18}}>الأصوات: <span className="count" data-testid="text-vote-count">{room.voteCount} / {room.players.length}</span></p></>}
       {room.phase==='result' && room.result && <><div className="phase-label">الجولة {room.round} · كشف الهوية</div><div className="result-hero"><ShieldQuestion size={38} style={{margin:'0 auto 10px'}}/><h2>{room.result.found?'مسكتوه!':'فاتكم المختلف!'}</h2><p>{room.result.found?'العين ما تخيب، عرفتوا مين المندس.':'عرف يخبّيها هالمرة... تردونها بالجولة الجاية؟'}</p></div><div className="player-row"><span className="player-id"><CrewAvatar name={room.players.find(p=>p.id===room.result?.imposterId)?.name??'لاعب'} index={2}/><span>المختلف كان <strong>{room.players.find(p=>p.id===room.result?.imposterId)?.name??'لاعب'}</strong></span></span><span className="tag">انكشف</span></div><p className="muted" style={{marginTop:18}}>الأكثر اتهاماً: <strong>{room.result.accusedId ? room.players.find(p=>p.id===room.result?.accusedId)?.name??'لاعب' : 'تعادل بالأصوات'}</strong></p><div className="secret"><small>والكلمة كانت</small><span className="result-word" data-testid="text-result-word">{room.result.word}</span></div>{room.isHost ? <Action testId="button-next-round" className="full" disabled={pending} onClick={()=>run(()=>startRound(code,{token}))}>جولة ثانية <RotateCcw size={18}/></Action> : <p className="muted">إذا تبون جولة ثانية، قائد المهمة يبدأها.</p>}</>}
      {error&&<ErrorNote message={error}/>}
    </div></div><aside className="room-aside"><div className="panel"><h3><UsersRound size={21} style={{display:'inline',verticalAlign:'middle'}}/> الربع <span className="count">{room.players.length}</span></h3><PlayerList players={room.players} state={room.phase==='clues'?'clues':room.phase==='voting'?'voting':undefined}/><p className="muted" style={{marginBottom:0}}>الموضوع: {categoryName(room.category)}</p></div><ChatBox room={room} code={code} token={token} onUpdate={onUpdate}/></aside></div>;
}

export function RoomPage() {
  const params=useParams<{code:string}>(); const code=(params.code||'').toUpperCase();
  const session=getSession(); const token=session?.code===code?session.token:'';
  const queryClient=useQueryClient();
  const query=useGetRoom(code,{token},{query:{enabled:!!code&&!!token,queryKey:getGetRoomQueryKey(code,{token}),refetchInterval:1500}});
  const room=query.data;
  const update=(value:RoomState)=>queryClient.setQueryData(getGetRoomQueryKey(code,{token}),value);
  return <div className="app" dir="rtl"><Header/><main className="game-shell"><BackLink/><PageTitle label="غرفة اللعب" title="المجلس جاهز؟" subtitle="السر بينكم... لا تفضحه."/>
    {!token ? <div className="panel"><h2>الغرفة تنتظرك</h2><p className="muted">ادخل اسمك عشان تشارك مع الربع في هالغرفة.</p><Link className="btn orange" href={`/join?code=${code}`} data-testid="link-join-this-room">انضم للغرفة <ArrowUpLeft size={18}/></Link></div> : query.isLoading ? <div className="panel"><div className="skeleton" style={{width:'45%'}}/><div className="skeleton"/><div className="skeleton" style={{width:'70%'}}/></div> : query.isError ? <div className="panel"><ErrorNote message="ما قدرنا نوصل للغرفة. تأكد من الاتصال أو ادخل من جديد." onRetry={()=>query.refetch()}/><Link href={`/join?code=${code}`} className="btn flat" data-testid="link-rejoin-room">ادخل برمز الغرفة</Link></div> : room ? <RoomGame key={`${room.round}-${room.phase}`} room={room} code={code} token={token} onUpdate={update}/> : <div className="panel"><EmptyNote>الغرفة مو متاحة حالياً.</EmptyNote></div>}
  </main></div>;
}