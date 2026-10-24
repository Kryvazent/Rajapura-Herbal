export const SITE_NAME = "Rajapura Herbal Company";
const DEFAULT_TITLE =
  "Rajapura Herbal Company | Authentic Sri Lankan Ayurvedic Remedies";
const DEFAULT_DESCRIPTION =
  "Discover Rajapura Herbal Company, offering authentic Sri Lankan Ayurvedic remedies, herbal products, services, and authorized store locations.";
export const pages: Record<string, { title: string; description: string }> = {
  "/": {
    title: DEFAULT_TITLE,
    description:
      "Explore authentic Sri Lankan herbal products crafted with Ayurvedic tradition, natural ingredients, and Rajapura family heritage.",
  },
  "/products": {
    title: "Herbal Products | Rajapura Herbal Company",
    description:
      "Browse Rajapura Herbal products including Ayurvedic oils, tonics, teas, powders, and natural wellness remedies.",
  },
  "/services": {
    title: "Ayurvedic Services | Rajapura Herbal Company",
    description:
      "Find Rajapura Herbal wellness services and Ayurvedic care locations for traditional herbal support.",
  },
  "/store-locator": {
    title: "Store Locator | Find Rajapura Herbal Products",
    description:
      "Find authorized Rajapura Herbal stores across Sri Lanka and locate herbal products near you.",
  },
  "/about": {
    title: "About Rajapura Herbal | Ayurvedic Heritage Since 1973",
    description:
      "Learn about Rajapura Herbal Company, its Sri Lankan Ayurvedic heritage, founder story, certifications, and commitment to natural wellness.",
  },
};
export const localizedPages = {
  si: { "/": { title: "රාජපුර හර්බල් | අව්‍යාජ ශ්‍රී ලාංකේය ආයුර්වේද නිෂ්පාදන", description: "ආයුර්වේද සම්ප්‍රදාය සහ ස්වභාවික අමුද්‍රව්‍ය සමඟ නිමවූ ශ්‍රී ලාංකේය ඖෂධීය නිෂ්පාදන ගවේෂණය කරන්න." }, "/products": { title: "ඖෂධීය නිෂ්පාදන | රාජපුර හර්බල්", description: "රාජපුර ආයුර්වේද තෙල්, ටොනික්, තේ, කුඩු සහ ස්වභාවික සුවතා නිෂ්පාදන බලන්න." }, "/services": { title: "ආයුර්වේද සේවාවන් | රාජපුර හර්බල්", description: "රාජපුර සුවතා සේවාවන්, ප්‍රතිකාර සහ ආයුර්වේද මධ්‍යස්ථාන සොයන්න." }, "/store-locator": { title: "වෙළඳසැල් සෙවුම | රාජපුර හර්බල්", description: "ශ්‍රී ලංකාව පුරා බලයලත් රාජපුර වෙළඳසැල් සොයන්න." }, "/about": { title: "රාජපුර ගැන | 1973 සිට ආයුර්වේද උරුමය", description: "රාජපුර සමාගම, එහි ආයුර්වේද උරුමය, නිර්මාතෘ, සහතික සහ ස්වභාවික සුවතාව පිළිබඳ දැනගන්න." } },
  ta: { "/": { title: "ராஜபுர ஹெர்பல் | உண்மையான இலங்கை ஆயுர்வேத தயாரிப்புகள்", description: "ஆயுர்வேத பாரம்பரியம் மற்றும் இயற்கை பொருட்களால் உருவாக்கப்பட்ட உண்மையான இலங்கை மூலிகை தயாரிப்புகளை ஆராயுங்கள்." }, "/products": { title: "மூலிகை தயாரிப்புகள் | ராஜபுர ஹெர்பல்", description: "ராஜபுர ஆயுர்வேத எண்ணெய்கள், டானிக்குகள், தேநீர், பொடிகள் மற்றும் இயற்கை நல தயாரிப்புகளைப் பாருங்கள்." }, "/services": { title: "ஆயுர்வேத சேவைகள் | ராஜபுர ஹெர்பல்", description: "ராஜபுர நல சேவைகள், சிகிச்சைகள் மற்றும் ஆயுர்வேத மையங்களைக் கண்டறியுங்கள்." }, "/store-locator": { title: "கடை கண்டுபிடிப்பான் | ராஜபுர ஹெர்பல்", description: "இலங்கை முழுவதும் அங்கீகரிக்கப்பட்ட ராஜபுர கடைகளைக் கண்டறியுங்கள்." }, "/about": { title: "ராஜபுர பற்றி | 1973 முதல் ஆயுர்வேத பாரம்பரியம்", description: "ராஜபுர நிறுவனம், அதன் ஆயுர்வேத பாரம்பரியம், நிறுவனர், சான்றிதழ்கள் மற்றும் இயற்கை நல அர்ப்பணிப்பைப் பற்றி அறியுங்கள்." } },
} as const;

export const seoNotFound = {
  en: { title: "Page Not Found | Rajapura Herbal Company", description: "The requested Rajapura Herbal page could not be found. Return to the homepage to explore products, services, and store locations." },
  si: { title: "පිටුව හමු නොවීය | රාජපුර හර්බල්", description: "ඉල්ලූ රාජපුර පිටුව හමු නොවීය. නිෂ්පාදන, සේවාවන් සහ වෙළඳසැල් ගවේෂණය කිරීමට මුල් පිටුවට යන්න." },
  ta: { title: "பக்கம் கிடைக்கவில்லை | ராஜபுர ஹெர்பல்", description: "கோரப்பட்ட ராஜபுர பக்கம் கிடைக்கவில்லை. தயாரிப்புகள், சேவைகள் மற்றும் கடைகளை ஆராய முகப்புக்குத் திரும்புங்கள்." },
} as const;

