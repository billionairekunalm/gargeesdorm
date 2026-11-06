export const SITE = {
  name: "Gargee's Dormitory",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  phone1: "9967393925",
  phone2: "8169936799",
  email: "mhatreprakash07@gmail.com",
  owner: "Prakash Mhatre",
  address: {
    street: "#401, 4th Floor, Bay View Tower, Plot No. 7, Opp. Dominoz Pizza, Sector-11",
    locality: "CBD Belapur, Navi Mumbai",
    region: "Maharashtra",
    postalCode: "400614",
    country: "IN",
  },
};
export const WA = `https://wa.me/91${SITE.phone1}?text=${encodeURIComponent(
  "Hi Gargee's Dormitory, I would like to book a bed. Please share availability and rates."
)}`;
export const CALL = `tel:+91${SITE.phone1}`;
export const CALL2 = `tel:+91${SITE.phone2}`;
export const MAP_Q = "Bay View Tower, Sector 11, CBD Belapur, Navi Mumbai 400614";
export const MAP_LINK = "https://maps.app.goo.gl/moTnzvSzURqzJGgs5";
export const GEO = { lat: 19.0177399, lng: 73.0447963 };
export const MAP_EMBED = `https://www.google.com/maps?q=${GEO.lat},${GEO.lng}&hl=en&z=17&output=embed`;

export const FAQ = [
  ["What is Gargee's Dormitory?", "Gargee's is a sea view facing AC and Non-AC dormitory in Sector 11, CBD Belapur, Navi Mumbai, with bunk beds that each have a privacy curtain, a power socket and a light."],
  ["How much does a bed cost?", "Beds at Gargee's start at just ₹300 per night. Call or WhatsApp 9967393925 to confirm availability."],
  ["Do you have both AC and Non-AC beds?", "Yes. We offer an AC dormitory and a Non-AC dormitory. Call or WhatsApp us to check which one has beds free today."],
  ["Is the dormitory open 24x7?", "Yes. Our service runs 24x7, so you can call or WhatsApp us at any hour to ask about a bed."],
  ["How do I book a bed?", "Message us on WhatsApp at 9967393925 or call 9967393925 / 8169936799. Beds start at just ₹300 per night. We will confirm availability with you directly."],
  ["What is included with each bed?", "Each bunk bed has clean white linen, a pillow, a folded blanket, a privacy curtain, its own power socket and light. AC dorm guests also get an AC remote."],
  ["Where exactly is the dormitory?", "#401, 4th Floor, Bay View Tower, Plot No. 7, Opposite Dominoz Pizza, Sector-11, CBD Belapur, Navi Mumbai - 400614."],
];
