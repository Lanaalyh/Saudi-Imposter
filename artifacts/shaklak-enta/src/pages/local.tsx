import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowUpLeft, Plus, Trash2, RotateCcw, UsersRound, Eye, EyeOff, Vote, ShieldQuestion } from 'lucide-react';
import { Header, PageTitle, Action, ErrorNote, CrewAvatar, MissionTrack } from '../components/game-ui';
import { localCategories, randomItem } from '../game-data';

type Stage = 'setup' | 'roles' | 'discussion' | 'voting' | 'result';
type LocalGame = { stage:Stage; names:string[]; category:string; word:string; imposter:number; round:number; turn:number; shown:boolean; votes:(number|null)[]; selected:number|null };
const storageKey='shaklak-local-game';
function initialGame():LocalGame { return {stage:'setup',names:['','',''],category:'food',word:'',imposter:-1,round:0,turn:0,shown:false,votes:[],selected:null}; }
function storedGame():LocalGame { try { const value=sessionStorage.getItem(storageKey); return value ? {...initialGame(),...JSON.parse(value),shown:false,selected:null} : initialGame(); } catch { return initialGame(); } }
function getAccused(votes:(number|null)[]):number|null {
  const counts=new Map<number,number>();votes.forEach(v=>{if(v!==null)counts.set(v,(counts.get(v)||0)+1);});
  const sorted=[...counts.entries()].sort((a,b)=>b[1]-a[1]); return sorted.length && (!sorted[1] || sorted[0][1]>sorted[1][1]) ? sorted[0][0] : null;
}

export default function LocalPage() {
  const [game,setGame]=useState<LocalGame>(storedGame);
  const [error,setError]=useState('');
  function update(next:LocalGame) { setGame(next);sessionStorage.setItem(storageKey,JSON.stringify(next)); }
  function start() {
    const names=game.names.map(name=>name.trim());
    if(names.length<3 || names.some(name=>!name)){setError('اكتب أسماء ٣ لاعبين على الأقل.');return;}
    if(new Set(names).size!==names.length){setError('خلّ كل لاعب باسم مختلف عشان التصويت يكون واضح.');return;}
    const category=localCategories.find(item=>item.id===game.category)!;
    const options=category.words.filter(word=>word!==game.word);
    update({...game,names,word:randomItem(options.length?options:category.words),imposter:Math.floor(Math.random()*names.length),round:game.round+1,stage:'roles',turn:0,shown:false,votes:[],selected:null});
    setError('');
  }
  function nextRole() {
    if(game.turn===game.names.length-1) update({...game,stage:'discussion',shown:false});
    else update({...game,turn:game.turn+1,shown:false});
  }
  function castVote() {
    if(game.selected===null || game.selected===game.turn)return;
    const votes=[...game.votes,game.selected];
    if(game.turn===game.names.length-1)update({...game,votes,selected:null,turn:0,stage:'result'});
    else update({...game,votes,selected:null,turn:game.turn+1,shown:false});
  }
  const accused=getAccused(game.votes);
  const found=accused===game.imposter;
  return <div className="app" dir="rtl"><Header/><main className="game-shell narrow"><Link href="/" className="small-link" data-testid="link-local-home" style={{display:'inline-flex',marginTop:10}}>الصفحة الرئيسية</Link><div style={{marginTop:27}}><MissionTrack phase={game.stage}/></div>
    {game.stage==='setup' && <><PageTitle label="جوال واحد، جمعة وحدة" title="جهّزوا السالفة" subtitle="اكتبوا أسماء الربع واختاروا موضوعكم. كل واحد بياخذ الجوال لحاله عشان يشوف دوره."/><div className="panel"><h3><UsersRound size={21} style={{display:'inline',verticalAlign:'middle'}}/> مين يلعب؟</h3>
      {game.names.map((name,index)=><label className="field" key={index}>اللاعب {index+1}<div style={{display:'flex',gap:9}}><input data-testid={`input-player-${index}`} maxLength={24} value={name} placeholder={`اسم اللاعب ${index+1}`} onChange={e=>{const names=[...game.names];names[index]=e.target.value;update({...game,names});}}/>{game.names.length>3&&<button type="button" data-testid={`button-remove-player-${index}`} className="btn tiny" aria-label={`احذف اللاعب ${index+1}`} onClick={()=>update({...game,names:game.names.filter((_,i)=>i!==index)})}><Trash2 size={17}/></button>}</div></label>)}
      <Action kind="plain" testId="button-add-player" disabled={game.names.length>=16} onClick={()=>update({...game,names:[...game.names,'']})}><Plus size={18}/> أضف لاعب</Action>
      <h3 style={{marginTop:35}}>اختاروا الموضوع</h3><div className="select-grid">{localCategories.map(item=><button key={item.id} type="button" data-testid={`button-local-category-${item.id}`} className={`select-card ${game.category===item.id?'selected':''}`} onClick={()=>update({...game,category:item.id})}><strong>{item.name}</strong><span>{item.description}</span></button>)}</div>
      {error&&<ErrorNote message={error}/>}<Action testId="button-start-local" className="full" onClick={start}>ابدأ اللعبة <ArrowUpLeft size={18}/></Action><p className="muted" style={{textAlign:'center',margin:'15px 0 0'}}>كل شيء يشتغل هنا، حتى بدون إنترنت.</p></div></>}
     {game.stage==='roles' && <><PageTitle label={`الجولة ${game.round} · توزيع الهويات`} title="ملفك السري ينتظرك" subtitle="مرّروا الجوال بالترتيب. لا أحد يطالع ملف غيره."/><div className="panel"><div className="phase-label">اللاعب {game.turn+1} من {game.names.length}</div><div className="local-progress">{game.names.map((_,i)=><span key={i} className={i<=game.turn?'active':''}/>)}</div><div className="turn-card"><CrewAvatar name={game.names[game.turn]} index={game.turn} large/><h2>الملف باسم {game.names[game.turn]}</h2><p>{game.shown?'احفظ هويتك، وبعدين اقفل الملف قبل ما تمرّر الجوال.':'تأكد الجوال معك لحالك قبل ما تكشف هويتك.'}</p>{game.shown&&<div className={`secret ${game.turn===game.imposter?'imposter':''}`}><small>{game.turn===game.imposter?'تقرير الهوية · المختلف':'تقرير الهوية · من الطاقم'}</small><div className="word" data-testid="text-local-role">{game.turn===game.imposter?'شكلك أنت!':game.word}</div><small>{game.turn===game.imposter?'ما عندك الكلمة. ركّز بتلميحاتهم وساير السالفة.':'تلميحك لازم يدل عليها، بدون ما تقولها.'}</small></div>}</div>
      {!game.shown ? <Action testId="button-reveal-local-role" className="full" onClick={()=>update({...game,shown:true})}><Eye size={18}/> اكشف دوري</Action> : <div className="row-actions"><Action kind="plain" testId="button-hide-local-role" onClick={()=>update({...game,shown:false})}><EyeOff size={18}/> اخفِ الدور</Action><Action testId="button-next-local-role" onClick={nextRole}>{game.turn===game.names.length-1?'ابدأوا السالفة':'مرّر الجوال'} <ArrowUpLeft size={18}/></Action></div>}</div></>}
     {game.stage==='discussion' && <><PageTitle label={`الجولة ${game.round} · وقت السالفة`} title="لمّحوا... لا تفضحوا" subtitle="خلّوا الجوال بالنص وابدأوا الكلام. كل لاعب يعطي تلميح عن الكلمة بدون ما يقولها."/><div className="panel"><div className="result-hero"><h2>واحد منكم ما يدري</h2><p>بيحاول يفهم الكلمة من تلميحاتكم. لا تسهّلونها عليه!</p></div><h3>ترتيب التلميحات المقترح</h3><div className="players">{game.names.map((name,index)=><div className="player-row" key={index}><span className="player-id"><CrewAvatar name={name} index={index}/>{name}</span><span className="tag">{index+1}</span></div>)}</div><p className="muted">كل واحد يقول تلميحه بصوت عالي. اسألوا بعض، وبعدها انتقلوا للتصويت. لا ترجعون تكشفون الأدوار قدّام الربع.</p><Action testId="button-start-local-voting" className="full" onClick={()=>update({...game,stage:'voting',turn:0,selected:null,shown:false})}>خلصنا السالفة، نصوّت <Vote size={18}/></Action></div></>}
     {game.stage==='voting' && <><PageTitle label={`الجولة ${game.round} · التصويت`} title="مين شكلك أنت؟" subtitle="كل واحد يصوّت بسرّية. مرّروا الجوال بنفس ترتيب الأسماء."/><div className="panel"><div className="phase-label">صوت {game.turn+1} من {game.names.length}</div><div className="local-progress">{game.names.map((_,i)=><span key={i} className={i<=game.turn?'active':''}/>)}</div><div className="turn-card"><CrewAvatar name={game.names[game.turn]} index={game.turn} large/><h2>الجوال مع {game.names[game.turn]}؟</h2><p>اختار المختلف من غير ما أحد يشوف صوتك.</p></div><div className="players">{game.names.map((name,index)=>index===game.turn?null:<button key={index} className={`vote-choice ${game.selected===index?'selected':''}`} type="button" data-testid={`button-local-vote-${index}`} onClick={()=>update({...game,selected:index})}><CrewAvatar name={name} index={index}/>{name}</button>)}</div><Action testId="button-confirm-local-vote" disabled={game.selected===null} className="full" onClick={castVote}>{game.turn===game.names.length-1?'اكشفوا النتيجة':'ثبّت صوتك ومرّر الجوال'} <ArrowUpLeft size={18}/></Action></div></>}
     {game.stage==='result' && <><PageTitle label={`الجولة ${game.round} · النتيجة`} title="انكشف الملف السري" subtitle="اللحظة اللي ينتظرها الطاقم: هل كان حدسكم في مكانه؟"/><div className="panel"><div className="result-hero"><ShieldQuestion size={39} style={{margin:'0 auto 10px'}}/><h2>{found?'مسكتوه!':'فاتكم المختلف!'}</h2><p>{found?'عرفتوا مين ما يعرف الكلمة. عينكم عليه!':'قدر يمشيها عليكم. له جولة ثانية؟'}</p></div><div className="player-row"><span className="player-id"><CrewAvatar name={game.names[game.imposter]} index={game.imposter}/><span>المختلف كان <strong>{game.names[game.imposter]}</strong></span></span><span className="tag">كشف الهوية</span></div><p className="muted" style={{marginTop:18}}>الأكثر اتهاماً: <strong>{accused===null?'تعادل بالأصوات':game.names[accused]}</strong></p><div className="secret"><small>الكلمة كانت</small><div className="result-word" data-testid="text-local-result-word">{game.word}</div></div><h3>سجل الأصوات</h3><div className="players">{game.names.map((name,i)=><div className="player-row" key={i}><span className="player-id"><CrewAvatar name={name} index={i}/>{name}</span><span className="tag">صوّت لـ {game.names[game.votes[i]!]}</span></div>)}</div><div className="row-actions"><Action testId="button-local-replay" onClick={start}>جولة ثانية <RotateCcw size={18}/></Action><Action kind="plain" testId="button-local-settings" onClick={()=>update({...game,stage:'setup',turn:0,shown:false,votes:[],selected:null})}>غيّر الربع أو الموضوع</Action></div></div></>}
  </main></div>;
}