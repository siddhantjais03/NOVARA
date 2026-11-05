import React from 'react';
import { ShieldCheck, Sparkles, Lock, Eye, FileText } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { AnnouncementBar } from '../../components/AnnouncementBar/AnnouncementBar';
import { Footer } from '../../components/Footer/Footer';
import '../Content/ContentPages.css';

export const PrivacyPolicyPage = () => {
  return (
    <div className="content-page-root">
      <AnnouncementBar />
      <Navbar />

      <header className="content-page-hero">
        <div className="content-hero-pill">
          <ShieldCheck size={14} />
          <span>Client Confidentiality &amp; Data Ethics</span>
        </div>
        <h1 className="content-hero-title">Privacy Policy &amp; Security</h1>
        <p className="content-hero-sub">
          How NOVARA protects your personal information and safeguards your patron records in accordance with global data regulations (GDPR &amp; CCPA).
        </p>
      </header>

      <main className="content-main-container">
        <article className="legal-document-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', marginBottom: '24px', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>EFFECTIVE DATE: NOVEMBER 2026</span>
            <span>•</span>
            <span>VERSION 2.4</span>
          </div>

          <div className="legal-section-block">
            <h2>1. Our Commitment to Discretion</h2>
            <p>
              At NOVARA Haute Couture ("NOVARA", "we", "our", or "us"), we hold patron confidentiality in the highest esteem. We treat your personal records, measurements, and purchasing history with absolute discretion. This Privacy Policy delineates the precise protocols governing how your data is gathered, encrypted, and processed.
            </p>
          </div>

          <div className="legal-section-block">
            <h2>2. Information Collected Upon Patronage</h2>
            <p>When interacting with our digital flagship or reserving private atelier fittings, we collect:</p>
            <ul>
              <li><strong>Identity Details:</strong> Legal name, salutation, delivery coordinates, telephone number, and email address.</li>
              <li><strong>Billing &amp; Payment Data:</strong> Transaction tokens, masked card identifiers, or UPI handles. We never store raw CVV codes or complete credit card PANs on unencrypted media.</li>
              <li><strong>Patron Preferences:</strong> Size profiles, wishlisted silhouettes, past purchase history, and bespoke color choices.</li>
              <li><strong>Technical Metadata:</strong> Anonymized IP addresses, browser specifications, and navigation telemetry used exclusively to enhance rendering speed.</li>
            </ul>
          </div>

          <div className="legal-section-block">
            <h2>3. Application of Personal Data</h2>
            <p>Your information is employed strictly to:</p>
            <ul>
              <li>Fulfill and disburse your fine garment consignments via insured express logistics.</li>
              <li>Issue serialized Certificates of Authenticity and digital atelier receipts.</li>
              <li>Communicate private collection invitations and VIP Patron Privilège rewards.</li>
              <li>Prevent unauthorized transaction fraud and verify identity credentials.</li>
            </ul>
          </div>

          <div className="legal-section-block">
            <h2>4. Third-Party Sharing Restrictions</h2>
            <p>
              NOVARA maintains a strict policy: <strong>we never sell, lease, or monetize patron information to third-party advertisers</strong>. Data is shared exclusively with certified white-glove partners essential to fulfilling your commission (e.g., DHL Luxury Logistics, our tier-1 encrypted banking payment gateways).
            </p>
          </div>

          <div className="legal-section-block">
            <h2>5. Your Rights &amp; Data Erasure</h2>
            <p>
              Under the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA), you retain the right to inspect, correct, export, or permanently erase your patron profile from our master database. To exercise your privacy rights, please address our Data Ethics Desk at <a href="mailto:privacy@novara.luxury" style={{ color: '#4f46e5' }}>privacy@novara.luxury</a>.
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

