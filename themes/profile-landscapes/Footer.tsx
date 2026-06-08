type Props = {
  studioName: string;
  phone: string;
  email: string;
  address: string;
  nav?: unknown[];
  legal: { acn: string; abn: string; licence: string; founded: number };
};

export function Footer({ studioName, phone, email, address, legal }: Props) {
  return (
    <footer>
      <div className="wrap">
        <div className="foot">
          <div>
            <div className="foot-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/logo.png" alt="" />
              <span>{studioName}</span>
            </div>
            <p className="foot-lede">
              Commercial landscape contractors, nursery &amp; design studio.
              Sydney, since {legal.founded}.
            </p>
            <div className="foot-contact">
              <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`}>{phone}</a>
              <a href={`mailto:${email}`}>{email}</a>
              <span>{address}</span>
            </div>
          </div>
          <div>
            <h5>Work</h5>
            <ul>
              <li><a href="/projects">Projects</a></li>
              <li><a href="/services">Services</a></li>
              <li><a href="/landscape-design">Design studio</a></li>
              <li><a href="/capability">Capability</a></li>
            </ul>
          </div>
          <div>
            <h5>Plants &amp; shop</h5>
            <ul>
              <li><a href="/nursery">Nursery</a></li>
              <li><a href="/encyclopedia">Encyclopedia</a></li>
              <li><a href="/shop">Shop</a></li>
            </ul>
          </div>
          <div>
            <h5>Studio</h5>
            <ul>
              <li><a href="/about">About</a></li>
              <li><a href="/careers">Careers</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/privacy">Privacy</a></li>
              <li><a href="/terms">Terms of trade</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <div className="fb-left">
            <span>© {legal.founded} – {new Date().getFullYear()} {studioName} (NSW) Pty Ltd</span>
            <span className="dot">·</span>
            <span>ACN {legal.acn}</span>
            <span className="dot">·</span>
            <span>ABN {legal.abn}</span>
            <span className="dot">·</span>
            <span>Contractor Licence {legal.licence}</span>
          </div>
          <div className="fb-right">
            <a href="/sitemap">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
