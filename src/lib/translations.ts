export type Locale = "en" | "hi";

export interface SiteContent {
  siteName: string;
  tagline: string;
  subTagline: string;
  emergencyCall: string;
  emergencyCallTel: string;
  emergencyNotice: string;
  privacyNotice: string;
  footerRights: string;
  nav: {
    howItWorks: string;
    privacy: string;
    call112: string;
  };
  home: {
    eyebrow: string;
    needBloodTitle: string;
    needBloodDesc: string;
    needBloodCta: string;
    donateTitle: string;
    donateDesc: string;
    donateCta: string;
    steps: {
      step1Title: string;
      step1Desc: string;
      step2Title: string;
      step2Desc: string;
      step3Title: string;
      step3Desc: string;
    };
  };
  common: {
    back: string;
    submit: string;
    loading: string;
    call: string;
    directions: string;
    whatsapp: string;
    findDonorsNearby: string;
  };
}

export const translations: Record<Locale, SiteContent> = {
  en: {
    siteName: "RaktSetu",
    tagline: "Find blood. Fast.",
    subTagline:
      "Search nearby blood banks. If none can help, reach donors who have confirmed they are available.",
    emergencyCall: "Call 112",
    emergencyCallTel: "tel:112",
    emergencyNotice:
      "In a life-threatening emergency, call 112 or go to the nearest hospital. Always call a blood bank to confirm stock.",
    privacyNotice:
      "Your privacy: A donor's name and number are shown only after they say yes.",
    footerRights: "RaktSetu — A free public service for India.",
    nav: {
      howItWorks: "How it works",
      privacy: "Privacy",
      call112: "Call 112",
    },
    home: {
      eyebrow: "BLOOD BANK AND DONOR FINDER",
      needBloodTitle: "I need blood",
      needBloodDesc: "Find blood banks and donors near the patient",
      needBloodCta: "Find Blood",
      donateTitle: "I want to donate",
      donateDesc: "Register so someone in need can reach you",
      donateCta: "Become a Donor",
      steps: {
        step1Title: "Enter the patient's details",
        step1Desc: "Name, age, blood group and location.",
        step2Title: "See blood banks near you",
        step2Desc: "Call or get directions in one tap.",
        step3Title: "Reach confirmed donors",
        step3Desc: "We ask nearby donors if they are available first.",
      },
    },
    common: {
      back: "Back",
      submit: "Submit",
      loading: "Loading...",
      call: "Call",
      directions: "Directions",
      whatsapp: "WhatsApp",
      findDonorsNearby: "Can't find blood? Find donors nearby",
    },
  },
  hi: {
    siteName: "RaktSetu",
    tagline: "रक्त चाहिए? अभी खोजें।",
    subTagline:
      "निकटतम ब्लड बैंक खोजें। यदि उपलब्ध न हो, तो पुष्टि किए गए रक्तदाताओं से संपर्क करें।",
    emergencyCall: "112 पर कॉल करें",
    emergencyCallTel: "tel:112",
    emergencyNotice:
      "आपातकालीन स्थिति में तुरंत 112 पर कॉल करें या नजदीकी अस्पताल जाएं। स्टॉक की पुष्टि के लिए हमेशा ब्लड बैंक को कॉल करें।",
    privacyNotice:
      "आपकी गोपनीयता: रक्तदाता का नाम और नंबर केवल उनकी सहमति के बाद ही दिखाया जाता है।",
    footerRights: "RaktSetu — भारत के लिए एक निशुल्क जन सेवा।",
    nav: {
      howItWorks: "यह कैसे काम करता है",
      privacy: "गोपनीयता",
      call112: "कॉल 112",
    },
    home: {
      eyebrow: "ब्लड बैंक एवं रक्तदाता खोज",
      needBloodTitle: "मुझे रक्त चाहिए",
      needBloodDesc: "मरीज के निकट ब्लड बैंक और रक्तदाता खोजें",
      needBloodCta: "रक्त खोजें",
      donateTitle: "मैं रक्तदान करना चाहता हूँ",
      donateDesc: "पंजीकरण करें ताकि जरूरतमंद आप तक पहुँच सकें",
      donateCta: "रक्तदाता बनें",
      steps: {
        step1Title: "मरीज की जानकारी दर्ज करें",
        step1Desc: "नाम, उम्र, रक्त समूह और स्थान।",
        step2Title: "निकटतम ब्लड बैंक देखें",
        step2Desc: "एक टैप में कॉल करें या रास्ता देखें।",
        step3Title: "पुष्टि किए गए रक्तदाताओं से जुड़ें",
        step3Desc: "हम पहले नजदीकी रक्तदाताओं से उपलब्धता पूछते हैं।",
      },
    },
    common: {
      back: "पीछे जाएं",
      submit: "जमा करें",
      loading: "लोड हो रहा है...",
      call: "कॉल करें",
      directions: "दिशा निर्देश",
      whatsapp: "व्हाट्सएप",
      findDonorsNearby: "रक्त नहीं मिला? नजदीकी रक्तदाता खोजें",
    },
  },
};

export const defaultLocale: Locale = "en";

export function getTranslation(locale: Locale = defaultLocale): SiteContent {
  return translations[locale] || translations.en;
}
