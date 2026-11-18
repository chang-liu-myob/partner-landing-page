import type { Metadata } from "next";
import { MyobLogo } from "@/components/MyobLogo";
import { partnerLandingContent } from "@/data/partner-landing";
import { landing as s } from "./landing.styles";
import "./partner-landing.scss";

export const metadata: Metadata = {
  title: "Join MYOB — offer for Canva users | MYOB Australia",
  description:
    "Mock partner landing: Canva users in Australia can join MYOB Business with an exclusive partner offer.",
};

export default function Home() {
  const {
    host,
    hero,
    offer,
    audienceStrip,
    featuresSection,
    features,
    stepsSection,
    steps,
    testimonial,
    finalCta,
    footer,
  } = partnerLandingContent;

  return (
    <div className={s.page}>
      <a className={s.skipLink} href="#main">
        Skip to main content
      </a>

      <header className={s.hostBar}>
        <a
          className={s.hostBrand}
          href={host.siteUrl}
          aria-label={host.name}
        >
          <MyobLogo className={s.hostLogo} aria-hidden />
          <span className={s.hostBadge}>{host.headerBadge}</span>
        </a>
      </header>

      <p className={s.partnerStrip}>{audienceStrip}</p>

      <section className={s.hero} aria-labelledby="hero-heading">
        <div className={s.heroInner}>
          <div>
            <span className={s.eyebrow}>{hero.eyebrow}</span>
            <h1 className={s.heroTitle} id="hero-heading">
              {hero.headline}
            </h1>
            <p className={s.heroLead}>{hero.subheadline}</p>
            <div className={s.ctaRow}>
              <a className={s.btnPrimary} href={hero.primaryCta.href}>
                {hero.primaryCta.label}
              </a>
              <a className={s.btnSecondary} href={hero.secondaryCta.href}>
                {hero.secondaryCta.label}
              </a>
            </div>
          </div>

          <aside className={s.offerCard} aria-labelledby="offer-title">
            <span className={s.offerBadge}>{offer.badge}</span>
            <h2 className={s.offerTitle} id="offer-title">
              {offer.title}
            </h2>
            <p className={s.offerBody}>{offer.description}</p>
            <p className={s.offerMeta}>
              {offer.eligibility}
              <br />
              <strong>{offer.expiresLabel}</strong>
            </p>
          </aside>
        </div>
      </section>

      <main id="main">
        <section
          id="features"
          className={`${s.section} ${s.sectionAlt}`}
          aria-labelledby="features-heading"
        >
          <h2 className={s.sectionTitle} id="features-heading">
            {featuresSection.title}
          </h2>
          <p className={s.sectionLead}>{featuresSection.lead}</p>
          <div className={s.featureGrid}>
            {features.map((feature) => (
              <article key={feature.title} className={s.featureCard}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={s.section} aria-labelledby="steps-heading">
          <h2 className={s.sectionTitle} id="steps-heading">
            {stepsSection.title}
          </h2>
          <p className={s.sectionLead}>{stepsSection.lead}</p>
          <ol className={s.steps}>
            {steps.map((step) => (
              <li key={step.step} className={s.stepCard}>
                <span className={s.stepNumber} aria-hidden="true">
                  {step.step}
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={`${s.section} ${s.sectionAlt}`}>
          <blockquote>
            <p className={s.quote}>{testimonial.quote}</p>
            <footer className={s.quoteAttrib}>
              — {testimonial.attribution}, {testimonial.role}
            </footer>
          </blockquote>
        </section>

        <section
          className={s.finalCta}
          aria-labelledby="final-cta-heading"
        >
          <h2 className={s.sectionTitle} id="final-cta-heading">
            {finalCta.headline}
          </h2>
          <p className={s.sectionLead}>{finalCta.body}</p>
          <a className={s.btnPrimary} href={finalCta.href}>
            {finalCta.buttonLabel}
          </a>
        </section>
      </main>

      <footer className={s.footer}>
        <div className={s.footerInner}>
          <p>{footer.disclaimer}</p>
          <ul className={s.footerLinks}>
            {footer.links.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  );
}