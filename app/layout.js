import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";
import { SITE, FAQ } from "@/lib/data";

const display = Fraunces({ subsets: ["latin"], variable: "--f-display", axes: ["opsz"] });
const body = Outfit({ subsets: ["latin"], variable: "--f-body" });

const title = "Gargee's Dormitory | AC & Non-AC Dormitory in CBD Belapur, Navi Mumbai";
const description =
  "Sea view facing AC & Non-AC dormitory in Sector 11, CBD Belapur, Navi Mumbai. Comfortable, clean beds from ₹300/night with privacy curtain, power socket & light. 24x7 service. Call or WhatsApp 9967393925.";

export const metadata = {
  metadataBase: new URL(SITE.url),
  title,
  description,
  keywords: ["dormitory in Navi Mumbai", "dormitory CBD Belapur", "AC dormitory Belapur", "Non-AC dormitory Navi Mumbai", "budget stay Belapur", "bunk bed dormitory", "sea view dormitory", "Gargee's Dormitory", "hostel near Belapur station"],
  alternates: { canonical: "/" },
  openGraph: { title, description, url: SITE.url, siteName: SITE.name, locale: "en_IN", type: "website", images: [{ url: "/img/bunk.jpg", width: 960, height: 1280, alt: "AC bunk bed with privacy curtain at Gargee's Dormitory" }] },
  twitter: { card: "summary_large_image", title, description, images: ["/img/bunk.jpg"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  icons: { icon: "/img/logo.png" },
  other: { "geo.region": "IN-MH", "geo.placename": "CBD Belapur, Navi Mumbai" },
};
export const viewport = { themeColor: "#0c1f44" };

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Hostel",
    "@id": `${SITE.url}/#hostel`,
    name: SITE.name,
    description,
    url: SITE.url,
    image: [`${SITE.url}/img/bunk.jpg`, `${SITE.url}/img/bed-1.jpg`, `${SITE.url}/img/bed-2.jpg`],
    logo: `${SITE.url}/img/logo.png`,
    telephone: [`+91${SITE.phone1}`, `+91${SITE.phone2}`],
    email: SITE.email,
    priceRange: "₹300+",
    founder: { "@type": "Person", name: SITE.owner },
    address: { "@type": "PostalAddress", streetAddress: SITE.address.street, addressLocality: "CBD Belapur, Navi Mumbai", addressRegion: SITE.address.region, postalCode: SITE.address.postalCode, addressCountry: "IN" },
    openingHoursSpecification: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "00:00", closes: "23:59" },
    amenityFeature: ["Air conditioned dormitory", "Non-AC dormitory", "Privacy curtain per bed", "Power socket per bed", "Reading light per bed", "Linen, pillow and blanket", "24x7 service", "Sea view facing"].map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
    areaServed: ["CBD Belapur", "Navi Mumbai", "Mumbai"],
    sameAs: [`https://wa.me/91${SITE.phone1}`],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  },
];

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        <link rel="preload" href="/audio/welcome-short.mp3" as="audio" type="audio/mpeg" />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
