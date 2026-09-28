import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter, Link } from 'wouter';
import Home from './pages/home';
import LocalPage from './pages/local';
import { CreatePage, JoinPage, RoomPage } from './pages/online';
import { Header } from './components/game-ui';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: true } } });

function NotFound() {
  return <div className="app" dir="rtl"><Header/><main className="game-shell narrow"><div className="panel" style={{marginTop:70,textAlign:'center'}}><span className="eyebrow">وين راحت الصفحة؟</span><h1 style={{fontSize:70,margin:'15px 0'}}>شكلك ضيّعت الطريق</h1><p className="muted">هالرابط ما له مكان عندنا. ارجع للمجلس من هنا.</p><Link href="/" className="btn orange" data-testid="link-not-found-home">الصفحة الرئيسية</Link></div></main></div>;
}

function App() {
  return <QueryClientProvider client={queryClient}><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Switch>
    <Route path="/" component={Home}/>
    <Route path="/create" component={CreatePage}/>
    <Route path="/join" component={JoinPage}/>
    <Route path="/room/:code" component={RoomPage}/>
    <Route path="/local" component={LocalPage}/>
    <Route component={NotFound}/>
  </Switch></WouterRouter></QueryClientProvider>;
}

export default App;