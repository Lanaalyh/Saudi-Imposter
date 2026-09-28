import { Link } from 'wouter';
import { ArrowLeft, Eye, EyeOff, ScanFace } from 'lucide-react';
import type { ReactNode } from 'react';

export function Header() {
  return <header className="topbar wrap">
    <Link href="/" className="brand" data-testid="link-home"><span className="brand-mark">؟</span> شكلك أنت</Link>
    <nav className="nav-side"><Link className="small-link" href="/join" data-testid="link-join">انضم لغرفة</Link><Link className="small-link" href="/local" data-testid="link-local">لعب حضوري</Link></nav>
  </header>;
}

export function CrewAvatar({ name, index = 0, large = false, hero = false }: { name: string; index?: number; large?: boolean; hero?: boolean }) {
  return <span className={`crew-avatar ${large ? 'large' : ''} ${hero ? 'hero-crew' : ''}`} data-variant={index % 4} role="img" aria-label={`هوية اللاعب ${name}`}><span>{name.charAt(0)}</span></span>;
}

export function MissionTrack({ phase }: { phase: 'lobby' | 'clues' | 'voting' | 'result' | 'roles' | 'discussion' | 'setup' }) {
  const steps = phase === 'setup' || phase === 'roles' || phase === 'discussion'
    ? [{id:'setup',name:'التجهيز'}, {id:'roles',name:'الهوية'}, {id:'discussion',name:'التلميح'}, {id:'voting',name:'التصويت'}, {id:'result',name:'الكشف'}]
    : [{id:'lobby',name:'التجمع'}, {id:'clues',name:'التلميح'}, {id:'voting',name:'التصويت'}, {id:'result',name:'الكشف'}];
  const current = steps.findIndex(step => step.id === phase);
  return <div className="mission-track" aria-label="مراحل المهمة">{steps.map((step,index)=><div key={step.id} className={`mission-node ${index===current?'active':index<current?'done':''}`} aria-current={index===current?'step':undefined}><span className="mission-dot">{index+1}</span><span>{step.name}</span></div>)}</div>;
}

export function PageTitle({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return <div className="page-heading"><span className="eyebrow">{label}</span><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>;
}

export function Action({ children, onClick, kind = 'orange', disabled = false, type = 'button', testId, className = '' }: { children: ReactNode; onClick?: () => void; kind?: 'orange' | 'yellow' | 'purple' | 'plain'; disabled?: boolean; type?: 'button' | 'submit'; testId: string; className?: string }) {
  return <button data-testid={testId} type={type} onClick={onClick} disabled={disabled} className={`btn ${kind === 'plain' ? '' : kind} ${className}`}>{children}</button>;
}

export function PlayerList({ players, state }: { players: { id: string; name: string; isHost?: boolean; hasClue?: boolean; hasVoted?: boolean }[]; state?: 'clues' | 'voting' }) {
  return <div className="players">{players.map((player,index) => <div className="player-row" key={player.id} data-testid={`player-${player.id}`}><div className="player-id"><CrewAvatar name={player.name} index={index}/><span>{player.name}</span></div><span className={`tag ${state === 'clues' && player.hasClue || state === 'voting' && player.hasVoted ? 'done' : ''}`}>{state === 'clues' ? player.hasClue ? 'أعطى تلميحه' : 'يفكر بتلميح' : state === 'voting' ? player.hasVoted ? 'صوّت' : 'ما صوّت' : player.isHost ? 'قائد المهمة' : 'جاهز للمهمة'}</span></div>)}</div>;
}

export function SecretCard({ revealed, imposter, word, onToggle }: { revealed: boolean; imposter: boolean; word: string | null; onToggle: () => void }) {
  return <div className={`secret ${revealed && imposter ? 'imposter' : ''}`}>
    {!revealed ? <><EyeOff size={29} strokeWidth={1.8}/><h2 style={{margin:'10px 0 4px'}}>ملف هويتك مغلق</h2><small>تأكد محد يطالع شاشتك قبل الفتح</small></> : imposter ? <><ScanFace size={33}/><small>تقرير الهوية السري</small><div className="word">شكلك أنت!</div><small>أنت المختلف. اسمع التلميحات واندس بينهم.</small></> : <><small>تقرير الهوية · الكلمة السرية</small><div className="word" data-testid="text-secret-word">{word}</div><small>أنت من الطاقم. لمّح بدون ما تفضح الكلمة.</small></>}
    <Action kind="plain" className="tiny" testId="button-toggle-secret" onClick={onToggle}>{revealed ? <><EyeOff size={16}/> إخفاء الدور</> : <><Eye size={16}/> اكشف دوري</>}</Action>
  </div>;
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="muted" style={{padding:'20px 0',textAlign:'center'}}>{children}</p>;
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="alert" role="alert" data-testid="status-error">{message} {onRetry && <button type="button" onClick={onRetry} data-testid="button-retry" style={{textDecoration:'underline',fontWeight:800}}>حاول مرة ثانية</button>}</div>;
}

export function BackLink({ href = '/' }: { href?: string }) {
  return <Link href={href} className="small-link" data-testid="link-back" style={{display:'inline-flex',gap:7,alignItems:'center',marginTop:10}}><ArrowLeft size={15}/> رجوع</Link>;
}