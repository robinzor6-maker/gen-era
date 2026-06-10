import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import CartDrawer from "@/components/store/CartDrawer";
import IntroSequence from "@/components/intro/IntroSequence";
import TempleHomePage from "@/pages/TempleHomePage";
import HomePage from "@/pages/HomePage";
import StorePage from "@/pages/StorePage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CheckoutPage from "@/pages/CheckoutPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import WishlistPage from "@/pages/WishlistPage";
import AccountPage from "@/pages/AccountPage";
import CommunityPage from "@/pages/CommunityPage";
import TemplePage from "@/pages/TemplePage";
import LorePage from "@/pages/LorePage";
import ARPage from "@/pages/ARPage";

function NotFound() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000005', color: '#d4a853', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
        <p style={{ color: '#f0c875' }}>Page not found.</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={TempleHomePage} />
      <Route path="/classic" component={HomePage} />
      <Route path="/store" component={StorePage} />
      <Route path="/store/:slug" component={ProductDetailPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/wishlist" component={WishlistPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/community" component={CommunityPage} />
      <Route path="/temple" component={TemplePage} />
      <Route path="/lore" component={LorePage} />
      <Route path="/ar" component={ARPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const alreadySeen = sessionStorage.getItem("gen-era-intro-seen") === "1";
  const [introVisible, setIntroVisible] = useState(!alreadySeen);

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      {introVisible && (
        <IntroSequence onComplete={() => setIntroVisible(false)} />
      )}
      <Router />
      <CartDrawer />
    </WouterRouter>
  );
}

export default App;
