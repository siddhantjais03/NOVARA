import React from 'react';
import { Scale, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { AnnouncementBar } from '../../components/AnnouncementBar/AnnouncementBar';
import { Footer } from '../../components/Footer/Footer';
import '../Content/ContentPages.css';

export const TermsPage = () => {
  return (
    <div className="content-page-root">
      <AnnouncementBar />
      <Navbar />

      <header className="content-page-hero">
        <div className="content-hero-pill">
          <Scale size={14} />
          <span>Legal Charter &amp; Purchasing Agreement</span>
        </div>
        <h1 className="content-hero-title">Terms &amp; Conditions</h1>
        <p className="content-hero-sub">
          The legal guidelines, acquisition terms, and client guarantees governing your patronage of NOVARA Atelier.
        </p>
      </header>

      <main className="content-main-container">
        <article className="legal-document-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', marginBottom: '24px', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>LAST REVISED: NOVEMBER 2026</span>
            <span>•</span>
            <span>NOVARA LUXURY GROUP S.P.A.</span>
          </div>

          <div className="legal-section-block">
            <h2>1. Atelier Service Scope</h2>
            <p>
              Welcome to the digital atelier of NOVARA Luxury Group S.p.A. By navigating our website, reserving appointments, or acquiring garments, you enter into a binding agreement with NOVARA governed by these Terms &amp; Conditions and applicable international commercial statutes.
            </p>
          </div>

          <div className="legal-section-block">
            <h2>2. Silhouette Orders &amp; Acquisition Authorization</h2>
            <p>
              All orders submitted through our storefront are subject to fabric verification and stock confirmation. Due to the limited nature of our small-batch production runs, an order confirmation email acknowledges receipt of your request; contract fulfillment occurs upon courier dispatch notification.
            </p>
            <p>
              We reserve the right to decline or cancel orders deemed inconsistent with our retail quantities or flagged by financial anti-fraud monitoring.
            </p>
          </div>

          <div className="legal-section-block">
            <h2>3. Pricing, Duties &amp; Luxury Currency Settlement</h2>
            <p>
              Prices are displayed in United States Dollars ($ USD) or applicable regional currencies. Complimentary express courier transit is granted on qualifying orders above $150. Any local cross-border import tariffs or duties exceeding standard checkout totals are handled transparently through our delivery partners.
            </p>
          </div>

          <div className="legal-section-block">
            <h2>4. 30-Day Atelier Return &amp; Exchange Guarantee</h2>
            <p>
              Patrons enjoy 30 calendar days from receipt of their consignment to initiate a complimentary return or size exchange. Silhouettes must be returned unworn, unwashed, and unblemished, with all silk ribbons, serialized authentication cards, and security seals intact.
            </p>
            <p>
              Bespoke made-to-measure commissions and fine jewelry altered to custom specifications are exempt from standard returns.
            </p>
          </div>

          <div className="legal-section-block">
            <h2>5. Intellectual Property &amp; Trademark Protection</h2>
            <p>
              All designs, visual silhouettes, editorial photography, typography, and the NOVARA emblem are protected trademarks and intellectual properties of NOVARA Luxury Group. Unauthorized reproduction or commercial imitation is strictly prohibited under international copyright law.
            </p>
          </div>

          <div className="legal-section-block">
            <h2>6. Governing Jurisdiction</h2>
            <p>
              These terms are interpreted and governed under the laws of the Republic of Italy and the international commercial jurisdiction of Milan, with reciprocal enforcement across all patron territories.
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

