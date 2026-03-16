import { useState, useEffect } from 'react'

const APP_URL = '/app.html'

const features = [
  { icon: '🏦', title: 'Import bancaire PDF', desc: 'Glisse tes releves Qonto, BNP, SG... Toutes les transactions extraites et categorisees automatiquement.' },
  { icon: '🤖', title: 'Comptable IA', desc: '3 experts en 1 : comptable senior, inspecteur des impots, avocat fiscaliste. Repond a toutes tes questions.' },
  { icon: '📊', title: 'Dashboard temps reel', desc: 'CA, depenses, tresorerie, solde bancaire au centime pres. Tout en un coup d\'oeil.' },
  { icon: '⭐', title: 'Optimisation fiscale', desc: 'CIR, CESU, IK, carry-back, holding... Toutes les astuces legales pour payer moins d\'impots.' },
  { icon: '🧾', title: 'Facturation PDF', desc: 'Cree et envoie des factures conformes avec toutes les mentions legales obligatoires.' },
  { icon: '📜', title: 'Lecture des statuts', desc: 'Importe tes statuts en PDF. Forme juridique, capital, dirigeant, regime TVA : tout est extrait.' },
  { icon: '📈', title: 'Previsionnel 12 mois', desc: 'Projections CA, depenses, tresorerie. Par mois ou par trimestre. Alertes automatiques.' },
  { icon: '📅', title: 'Echeancier fiscal', desc: 'IS, TVA, CFE, CVAE, URSSAF... Plus jamais de retard. Chaque echeance avec le montant estime.' },
  { icon: '🏛️', title: 'Declarations pre-remplies', desc: 'CA3, CA12, 2065, liasse 2033, DAS2, FEC. Generes en un clic avec tes vrais chiffres.' },
  { icon: '📸', title: 'Scanner OCR', desc: 'Photographie un ticket ou une facture. Le montant, la date et le fournisseur sont detectes.' },
  { icon: '📋', title: 'Grand Livre & Journal', desc: 'Comptabilite en partie double, plan comptable general, ecritures automatiques.' },
  { icon: '💡', title: 'Conseils contextuels', desc: 'Des alertes personnalisees : seuils TVA, impots, tresorerie. Basees sur TA situation.' },
]

const comparison = [
  { feature: 'Import bancaire automatique', them: true, us: true },
  { feature: 'Dashboard & KPIs', them: true, us: true },
  { feature: 'Facturation PDF', them: true, us: true },
  { feature: 'Bilan & compte de resultat', them: true, us: true },
  { feature: 'FEC (controle fiscal)', them: true, us: true },
  { feature: 'Declarations pre-remplies', them: true, us: true },
  { feature: 'Assistant IA comptable', them: false, us: true },
  { feature: 'Optimisation fiscale avancee', them: false, us: true },
  { feature: 'Lecture auto des statuts', them: false, us: true },
  { feature: 'Scanner OCR tickets', them: true, us: true },
  { feature: '100% gratuit', them: false, us: true },
  { feature: 'Aucun compte a creer', them: false, us: true },
  { feature: 'Donnees 100% locales', them: false, us: true },
]

const testimonials = [
  { text: "J'ai remplace mon comptable a 150 euros/mois. FiscaPro fait tout ce qu'il faisait, en mieux, et gratuitement.", name: 'Marie D.', role: 'Freelance design, SASU', initials: 'MD' },
  { text: "L'IA m'a fait economiser 4 200 euros d'IS en me suggerant le timing des depenses avant cloture. Mon comptable n'y avait jamais pense.", name: 'Thomas R.', role: 'Dev independant, EURL', initials: 'TR' },
  { text: "J'ai importe mes 15 releves Qonto d'un coup. 149 transactions categorisees en 3 secondes. Bluffant.", name: 'Sarah K.', role: 'Organisme de formation, SAS', initials: 'SK' },
]

function App() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* NAV */}
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-inner">
          <a href="#" className="nav-logo">
            <div className="nav-logo-icon">F</div>
            <span>FiscaPro</span>
          </a>
          <div className="nav-links">
            <a href="#features">Fonctionnalites</a>
            <a href="#comparison">Comparatif</a>
            <a href="#testimonials">Temoignages</a>
            <a href={APP_URL} className="btn btn-primary nav-cta" target="_blank" rel="noopener">Lancer l'app</a>
          </div>
          <button className="nav-mobile" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
        {menuOpen && (
          <div style={{ background: 'var(--white)', padding: '16px 24px', borderTop: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="#features" onClick={() => setMenuOpen(false)} style={{ fontSize: '15px', fontWeight: 500, color: 'var(--gray-700)', textDecoration: 'none', padding: '8px 0' }}>Fonctionnalites</a>
            <a href="#comparison" onClick={() => setMenuOpen(false)} style={{ fontSize: '15px', fontWeight: 500, color: 'var(--gray-700)', textDecoration: 'none', padding: '8px 0' }}>Comparatif</a>
            <a href="#testimonials" onClick={() => setMenuOpen(false)} style={{ fontSize: '15px', fontWeight: 500, color: 'var(--gray-700)', textDecoration: 'none', padding: '8px 0' }}>Temoignages</a>
            <a href={APP_URL} className="btn btn-primary" target="_blank" rel="noopener" style={{ textAlign: 'center', justifyContent: 'center' }}>Lancer l'app</a>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <div className="label" style={{ color: 'var(--mint)' }}>Expert comptable virtuel gratuit</div>
            <h1>Ta compta.<br/>Sans comptable.<br/>Sans payer.</h1>
            <p className="subtitle">L'outil qui remplace ton expert-comptable a 150 euros/mois. Import bancaire, IA fiscaliste, optimisation — tout est gratuit, tout reste sur ton appareil.</p>
            <div className="hero-actions">
              <a href={APP_URL} className="btn btn-primary btn-lg" target="_blank" rel="noopener">Commencer maintenant</a>
              <a href="#features" className="btn btn-ghost btn-lg">Decouvrir</a>
            </div>
            <div className="hero-stats">
              <div><div className="hero-stat-value">0 euros</div><div className="hero-stat-label">Pour toujours</div></div>
              <div><div className="hero-stat-value">30 sec</div><div className="hero-stat-label">Pour demarrer</div></div>
              <div><div className="hero-stat-value">100%</div><div className="hero-stat-label">Donnees locales</div></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-mockup">
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }}></div>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }}></div>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }}></div>
              </div>
              <div className="mock-bar" style={{ width: '60%', background: 'rgba(126,200,168,.3)' }}></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {['17 543,37 euros', '85 420 euros', '67 877 euros', '15%'].map((v, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,.04)', borderRadius: 8, padding: '12px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: i === 0 ? '#7EC8A8' : i === 3 ? '#D4A843' : 'rgba(255,255,255,.8)' }}>{v}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>{['Solde bancaire', 'CA HT', 'Depenses', 'IS effectif'][i]}</div>
                  </div>
                ))}
              </div>
              {[1, 2, 3].map(i => (
                <div className="mock-row" key={i}>
                  <div className="mock-dot" style={{ background: i === 1 ? '#7EC8A8' : i === 2 ? '#E87070' : '#D4A843' }}></div>
                  <div className="mock-line" style={{ background: 'rgba(255,255,255,.08)', width: `${50 + i * 15}%` }}></div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', whiteSpace: 'nowrap' }}>{['+4 200 euros', '-1 680 euros', '-142 euros'][i - 1]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="section problem" id="problem">
        <div className="container">
          <div className="label">Le probleme</div>
          <h2>La compta en France, c'est un enfer</h2>
          <p className="subtitle">89 euros a 199 euros/mois pour un comptable en ligne. Des formulaires incomprehensibles. Des echeances qu'on oublie. Et au final, zero conseil d'optimisation.</p>
          <div className="problem-grid">
            <div className="problem-card">
              <div className="icon">💸</div>
              <h3>1 000 a 2 400 euros/an</h3>
              <p>C'est ce que paye un auto-entrepreneur ou une petite SAS pour un comptable en ligne. Pour saisir des factures et faire une declaration.</p>
            </div>
            <div className="problem-card">
              <div className="icon">🤷</div>
              <h3>Zero optimisation</h3>
              <p>Ton comptable fait le minimum : il saisit, il declare. Il ne te dit jamais comment payer moins d'impots legalement.</p>
            </div>
            <div className="problem-card">
              <div className="icon">🔒</div>
              <h3>Tes donnees captives</h3>
              <p>Tu changes de comptable ? Bonne chance pour recuperer tes donnees. Ici, tout reste sur ton appareil, toujours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="container">
          <div className="label">Fonctionnalites</div>
          <h2>Tout ce qu'un comptable fait.<br/>Et plus encore.</h2>
          <p className="subtitle">Import bancaire, IA fiscaliste, optimisation avancee, declarations pre-remplies. Le tout gratuitement.</p>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="section comparison" id="comparison">
        <div className="container">
          <div className="label">Comparatif</div>
          <h2>FiscaPro vs comptable en ligne</h2>
          <p className="subtitle">Les memes fonctionnalites que Clementine, Indy ou Dougs. Plus l'IA. Et c'est gratuit.</p>
          <div className="comp-table">
            <div className="comp-row comp-header">
              <div></div>
              <div className="comp-check" style={{ fontSize: 13 }}>Comptable en ligne</div>
              <div className="comp-check comp-highlight comp-header" style={{ borderRadius: '12px 12px 0 0' }}>FiscaPro</div>
            </div>
            {comparison.map((c, i) => (
              <div className="comp-row" key={i}>
                <div className="comp-feature">{c.feature}</div>
                <div className="comp-check">{c.them ? '✅' : '❌'}</div>
                <div className="comp-check comp-highlight">{c.us ? '✅' : '❌'}</div>
              </div>
            ))}
            <div className="comp-row comp-price-row">
              <div className="comp-feature">Prix</div>
              <div className="comp-check" style={{ fontSize: 15, fontWeight: 800 }}>89-199 euros/mois</div>
              <div className="comp-check comp-highlight" style={{ fontSize: 18, fontWeight: 900, color: '#7EC8A8', background: 'var(--green-darker)' }}>Gratuit</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="container">
          <div className="label">Comment ca marche</div>
          <h2>3 etapes. 30 secondes.</h2>
          <p className="subtitle">Pas de compte a creer. Pas de carte bancaire. Tu ouvres, tu configures, c'est parti.</p>
          <div className="problem-grid" style={{ marginTop: 48 }}>
            {[
              { step: '01', icon: '🔢', title: 'Entre ton SIREN', desc: 'Tout est detecte automatiquement : nom, forme juridique, code APE, regime TVA, regime fiscal. En 3 secondes.' },
              { step: '02', icon: '📄', title: 'Importe tes releves', desc: 'Glisse tes PDFs bancaires. Toutes les transactions sont extraites, categorisees, et integrees dans ta compta.' },
              { step: '03', icon: '💬', title: 'Demande a l\'IA', desc: 'Pose n\'importe quelle question. Optimisation IS, dividendes, deductions, echeances — ton expert repond en 5 secondes.' },
            ].map((s, i) => (
              <div className="problem-card" key={i} style={{ position: 'relative', borderTop: '3px solid var(--green)' }}>
                <div style={{ position: 'absolute', top: -14, left: 20, background: 'var(--green)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 6 }}>{s.step}</div>
                <div className="icon" style={{ marginTop: 8 }}>{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section" style={{ background: 'var(--gray-50)' }} id="testimonials">
        <div className="container">
          <div className="label">Temoignages</div>
          <h2>Ils ont lache leur comptable</h2>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div className="testimonial" key={i}>
                <div className="testimonial-text">"{t.text}"</div>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section className="section-sm">
        <div className="container" style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: 24 }}>Tes donnees ne quittent jamais ton appareil</h3>
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: '💻', text: 'Stockage 100% local (localStorage)' },
              { icon: '🚫', text: 'Aucun serveur, aucun compte' },
              { icon: '🔐', text: 'Cle API chiffree cote client' },
              { icon: '📂', text: 'Export tes donnees a tout moment' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--gray-600)' }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <span>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <h2>Pret a virer ton comptable ?</h2>
          <p className="subtitle">Gratuit. Sans compte. 30 secondes pour commencer.</p>
          <a href={APP_URL} className="btn btn-primary btn-lg" target="_blank" rel="noopener" style={{ background: '#fff', color: 'var(--green-dark)' }}>
            Lancer FiscaPro maintenant
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <span>FiscaPro</span>
              <p>L'expert-comptable virtuel gratuit pour les TPE/PME francaises. Open source.</p>
            </div>
            <div className="footer-col">
              <h4>Produit</h4>
              <a href="#features">Fonctionnalites</a>
              <a href="#comparison">Comparatif</a>
              <a href={APP_URL} target="_blank" rel="noopener">Lancer l'app</a>
            </div>
            <div className="footer-col">
              <h4>Ressources</h4>
              <a href="https://github.com/FCF-TRD/fiscapro" target="_blank" rel="noopener">GitHub</a>
              <a href="https://github.com/FCF-TRD/fiscapro/issues" target="_blank" rel="noopener">Signaler un bug</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#">Mentions legales</a>
              <a href="#">Confidentialite</a>
            </div>
          </div>
          <div className="footer-bottom">
            FiscaPro — Open source, gratuit, pour toujours. Ne remplace pas un expert-comptable inscrit a l'Ordre.
          </div>
        </div>
      </footer>
    </>
  )
}

export default App
