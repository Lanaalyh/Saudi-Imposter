import { Link } from 'wouter';
import { ArrowUpLeft, UsersRound, Smartphone, MessageCircle, Fingerprint, Vote, UtensilsCrossed, MapPin, Shirt, Coffee, AudioLines } from 'lucide-react';
import { Header, CrewAvatar } from '../components/game-ui';

export default function Home() {
  return <div className="app" dir="rtl"><Header/>
    <main>
      <section className="hero wrap">
        <div><span className="eyebrow">ملف المهمة ٠١ · تحقيق الربع</span><h1>شكلك <span>أنت!</span></h1><p className="hero-copy">الطاقم كله يعرف السر... إلا واحد بينكم. لمّحوا للكلمة، راقبوا بعض، واكشفوا المختلف قبل ما يفلت.</p>
          <div className="hero-actions"><Link href="/create" className="btn orange" data-testid="link-create-room">سوّ غرفة <ArrowUpLeft size={20}/></Link><Link href="/join" className="btn" data-testid="link-join-room">عندك رمز؟ انضم</Link></div>
          <p className="hero-note">٣ لاعبين أو أكثر · بدون تحميل · التحقيق عليكم</p>
        </div>
        <div className="hero-art" role="img" aria-label="ملفات سرية وشخصية طاقم فضائي بلمسة سعودية"><div className="art-halo"/><div className="playing-card card-back"><span>؟</span></div><div className="playing-card card-front"><CrewAvatar name="س" index={0} hero/><strong>مين المختلف؟</strong></div><div className="art-sticker">الملف: سري للغاية</div><div className="art-sticker bottom">واحد منكم ما يدري</div></div>
      </section>
      <div className="ticker" aria-hidden="true"><span>ملف سري</span> · <span>هوية مجهولة</span> · <span>تلميح واحد</span> · <span>مين المختلف؟</span> · <span>ملف سري</span> · <span>هوية مجهولة</span> · <span>تلميح واحد</span> ·</div>
      <section className="section wrap" id="play"><span className="eyebrow">بلاغ التجمع</span><h2 className="section-heading">كل الربع في المهمة،<br/>وين ما كانوا.</h2><p className="section-sub">اختر طريقة اللعب وابدأ التحقيق.</p>
        <div className="mode-grid"><div className="mode-card orange-bg"><span className="mode-icon"><UsersRound size={29}/></span><h3>كل واحد بجواله</h3><p>افتح غرفة تحقيق، أرسل الرمز للربع، وكل واحد يستلم هويته السرية.</p><Link className="btn yellow" href="/create" data-testid="link-online-mode">ابدأ عن بُعد <ArrowUpLeft size={19}/></Link><span className="mode-doodle">؟</span></div>
        <div className="mode-card yellow-bg"><span className="mode-icon"><Smartphone size={29}/></span><h3>جوال واحد يكفي</h3><p>قاعدين بنفس المكان؟ مرّر الجوال بينكم، والسر يبقى سر.</p><Link className="btn purple" href="/local" data-testid="link-local-mode">العبوا حضوري <ArrowUpLeft size={19}/></Link><span className="mode-doodle">!</span></div></div>
      </section>
      <section className="section wrap" style={{paddingTop:10}}><span className="eyebrow">بروتوكول المهمة</span><h2 className="section-heading">السر بينكم،<br/>والشك على الجميع.</h2><div className="steps">
        <div className="step"><b>٠١</b><h3>استلم هويتك</h3><p>لكل لاعب ملف سري. الكل يعرف الكلمة، إلا شخص واحد يظهر له: شكلك أنت.</p><Fingerprint size={30}/></div>
        <div className="step"><b>٠٢</b><h3>أرسل تلميحك</h3><p>قول شيء يدل على الكلمة بدون ما تفصح عنها. المختلف بيحاول يندمج بينكم.</p><MessageCircle size={30}/></div>
        <div className="step"><b>٠٣</b><h3>صوّت واكشف</h3><p>راجع التلميحات واتهم واحداً من الطاقم. هل قبضتم على المختلف؟</p><Vote size={30}/></div>
      </div></section>
      <section className="categories-strip"><div className="wrap"><span className="eyebrow">أرشيف الديرة</span><h2 className="section-heading" style={{marginTop:17}}>حتى في المدار،<br/>السالفة من ديرتنا.</h2><p className="section-sub">مواضيع سعودية تعرفونها زين... أو هذا اللي تظنونه.</p><div className="category-list"><span className="category-pill"><UtensilsCrossed size={18} style={{display:'inline',verticalAlign:'middle'}}/> أكلات سعودية</span><span className="category-pill"><AudioLines size={18} style={{display:'inline',verticalAlign:'middle'}}/> كلمات سعودية</span><span className="category-pill"><MapPin size={18} style={{display:'inline',verticalAlign:'middle'}}/> أماكن من ديرتنا</span><span className="category-pill"><Coffee size={18} style={{display:'inline',verticalAlign:'middle'}}/> عادات وتقاليد</span><span className="category-pill"><Shirt size={18} style={{display:'inline',verticalAlign:'middle'}}/> أزياء تقليدية</span></div></div></section>
      <section className="section wrap" style={{textAlign:'center'}}><span className="eyebrow">الطاقم ينتظرك</span><h2 className="section-heading" style={{marginTop:20}}>جهّز الربع.<br/>خلّ الشك يبدأ.</h2><p className="section-sub">ملف جديد، سر جديد، ومختلف جديد.</p><div className="hero-actions" style={{justifyContent:'center'}}><Link href="/create" className="btn orange" data-testid="link-create-bottom">سوّ غرفة الحين <ArrowUpLeft size={19}/></Link><Link href="/local" className="btn yellow" data-testid="link-local-bottom">العبوا بجوال واحد</Link></div></section>
    </main><footer className="footer wrap"><span className="brand"><span className="brand-mark">؟</span> شكلك أنت</span><span>مهمة للّمة الربع، من ديرتنا ولكم.</span></footer>
  </div>;
}