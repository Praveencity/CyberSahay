import { guides } from "./awareness.js";
import bn from "./awareness-bn.js";
import ta from "./awareness-ta.js";

import { portalLanguages } from "./languages.js";
import { hinglishUi } from "../locales/hinglish-ui.js";
import hinglish from "./awareness-hi-Latn.js";

export const awarenessLanguages = {
  ...portalLanguages,
  bn: "বাংলা",
  ta: "தமிழ்",
};

const guideTranslations = { bn, ta, "hi-Latn": hinglish };
const translatedLabels = {
  "Cyber awareness": ["সাইবার সচেতনতা", "இணையப் பாதுகாப்பு விழிப்புணர்வு"],
  "Guide language": ["গাইডের ভাষা", "வழிகாட்டியின் மொழி"],
  "Look up a message, payment request or account problem. Each guide explains what to check and what to keep.": [
    "সন্দেহজনক বার্তা, পেমেন্টের অনুরোধ বা অ্যাকাউন্টের সমস্যা খুঁজুন। কী যাচাই করতে হবে এবং কী প্রমাণ রাখতে হবে তা প্রতিটি গাইডে বলা আছে।",
    "செய்தி, பணம் செலுத்தும் கோரிக்கை அல்லது கணக்குச் சிக்கலைத் தேடுங்கள். எதைச் சரிபார்க்க வேண்டும், எதைச் சேமிக்க வேண்டும் என்பதை ஒவ்வொரு வழிகாட்டியும் விளக்குகிறது.",
  ],
  "Find a safety topic": ["নিরাপত্তার বিষয় খুঁজুন", "பாதுகாப்புத் தலைப்பைத் தேடுங்கள்"],
  "All topics": ["সব বিষয়", "அனைத்துத் தலைப்புகள்"],
  "Money & payments": ["টাকা ও পেমেন্ট", "பணம் மற்றும் பரிவர்த்தனை"],
  "Messages & calls": ["বার্তা ও কল", "செய்திகளும் அழைப்புகளும்"],
  "Account security": ["অ্যাকাউন্ট সুরক্ষা", "கணக்குப் பாதுகாப்பு"],
  "Evidence & reporting": ["প্রমাণ ও অভিযোগ", "ஆதாரமும் புகாரும்"],
  "Guides": ["গাইড", "வழிகாட்டிகள்"],
  "No matching topics.": ["মেলে এমন বিষয় পাওয়া যায়নি।", "பொருந்தும் தலைப்புகள் இல்லை."],
  "Read guide": ["গাইড পড়ুন", "வழிகாட்டியைப் படியுங்கள்"],
  "Show all guides": ["সব গাইড দেখুন", "அனைத்து வழிகாட்டிகளையும் காணுங்கள்"],
  "All safety topics": ["নিরাপত্তার সব বিষয়", "அனைத்துப் பாதுகாப்புத் தலைப்புகளும்"],
  "Warning signs": ["সতর্কতার লক্ষণ", "எச்சரிக்கை அறிகுறிகள்"],
  "A safer response": ["নিরাপদ পদক্ষেপ", "பாதுகாப்பான நடவடிக்கை"],
  "Action checklist": ["করণীয় তালিকা", "செயல் பட்டியல்"],
  "Your action checklist": ["আপনার করণীয় তালিকা", "உங்கள் செயல் பட்டியல்"],
  "What you can do": ["আপনি যা করতে পারেন", "நீங்கள் செய்யக்கூடியவை"],
  "Next steps": ["পরের পদক্ষেপ", "அடுத்த படிகள்"],
  "Editor’s note": ["সম্পাদকের নোট", "ஆசிரியரின் குறிப்பு"],
  "In this guide": ["এই গাইডে", "இந்த வழிகாட்டியில்"],
  "Related guides": ["সম্পর্কিত গাইড", "தொடர்புடைய வழிகாட்டிகள்"],
  "Trusted references": ["বিশ্বস্ত সূত্র", "நம்பகமான ஆதாரங்கள்"],
  "Further reading": ["আরও পড়ুন", "மேலும் படிக்க"],
  "Payment safety": ["নিরাপদ পেমেন্ট", "பரிவர்த்தனைப் பாதுகாப்பு"],
  "Account recovery": ["অ্যাকাউন্ট পুনরুদ্ধার", "கணக்கு மீட்பு"],
  "FTC · Recognizing phishing": ["FTC · ফিশিং চেনার উপায়", "FTC · ஃபிஷிங்கை அடையாளம் காணுதல்"],
  "FTC · Job scams": ["FTC · চাকরির প্রতারণা", "FTC · வேலைவாய்ப்பு மோசடி"],
  "Kerala Police · Steps after cyber fraud": ["কেরল পুলিশ · সাইবার প্রতারণার পর করণীয়", "கேரள காவல்துறை · இணைய மோசடிக்குப் பின் செய்ய வேண்டியவை"],
  "Official reporting in India": ["ভারতে সরকারি অভিযোগের মাধ্যম", "இந்தியாவில் அதிகாரப்பூர்வப் புகார் வழிகள்"],
  "For financial cyber fraud, contact your bank immediately and call the national helpline.": [
    "আর্থিক সাইবার প্রতারণা হলে অবিলম্বে আপনার ব্যাংকের সঙ্গে যোগাযোগ করুন এবং জাতীয় সহায়তা নম্বরে ফোন করুন।",
    "இணைய நிதி மோசடி நடந்தால் உடனே உங்கள் வங்கியைத் தொடர்பு கொண்டு தேசிய உதவி எண்ணை அழையுங்கள்.",
  ],
  "Turn your notes into a clear complaint": ["তথ্য গুছিয়ে অভিযোগ লিখুন", "குறிப்புகளைக் கொண்டு தெளிவான புகாரைத் தயாரியுங்கள்"],
  "Our guided workspace helps you organize the facts, review your draft and download a PDF. You submit it through official channels.": [
    "সহায়কের সাহায্যে তথ্য গুছিয়ে খসড়া দেখুন এবং PDF ডাউনলোড করুন। অভিযোগ সরকারি মাধ্যমে আপনাকেই জমা দিতে হবে।",
    "வழிகாட்டும் உதவியாளர் மூலம் உண்மைகளை ஒழுங்குபடுத்தி, வரைவைச் சரிபார்த்து PDF பதிவிறக்குங்கள். புகாரை அதிகாரப்பூர்வ வழியில் நீங்களே சமர்ப்பிக்க வேண்டும்.",
  ],
  "Prepare a complaint": ["অভিযোগের খসড়া তৈরি করুন", "புகாரைத் தயாரியுங்கள்"],
  "Use this as a personal reminder. These checks stay on this page and are not a report.": [
    "মনে রাখার জন্য এই তালিকাটি ব্যবহার করুন। চিহ্নগুলো শুধু এই পেজে থাকে। অভিযোগ করতে সরকারি মাধ্যম ব্যবহার করুন।",
    "நினைவூட்டலாக இந்தப் பட்டியலைப் பயன்படுத்துங்கள். தேர்வுகள் இந்தப் பக்கத்தில் மட்டுமே இருக்கும். புகாரளிக்க அதிகாரப்பூர்வ வழியைப் பயன்படுத்துங்கள்.",
  ],
  "Check before approving a payment": ["পেমেন্ট অনুমোদনের আগে যাচাই করুন", "பரிவர்த்தனையை உறுதிசெய்யும் முன் சரிபாருங்கள்"],
  "A familiar logo or a screenshot of a successful payment does not confirm that money reached your account. Open your own bank or payment app to check the transaction.": [
    "পরিচিত লোগো বা সফল পেমেন্টের স্ক্রিনশট দেখে টাকা পাওয়া নিশ্চিত হয় না। নিজের ব্যাংক বা পেমেন্ট অ্যাপে লেনদেনটি দেখুন।",
    "பழக்கமான சின்னமோ பணம் அனுப்பியதாகக் காட்டும் திரைப்பிடிப்போ பணம் வந்ததை உறுதிசெய்யாது. உங்கள் வங்கி அல்லது பணப் பரிவர்த்தனைச் செயலியில் பாருங்கள்.",
  ],
  "Read the amount, recipient and payment direction on your own app.": [
    "নিজের অ্যাপে পরিমাণ, প্রাপক এবং টাকা আসছে না যাচ্ছে তা পড়ুন।",
    "உங்கள் செயலியில் தொகை, பெறுபவர், பணம் வருகிறதா செல்கிறதா என்பதைப் பாருங்கள்.",
  ],
  "Do not enter a UPI PIN to receive money or a refund.": ["টাকা বা ফেরত পেতে UPI পিন দেবেন না।", "பணம் அல்லது பணத்தைத் திரும்பப் பெற UPI PIN உள்ளிடாதீர்கள்."],
  "If money was lost, contact your bank and report promptly using the official channels below.": [
    "টাকা হারালে ব্যাংকে জানান এবং নিচের সরকারি মাধ্যমে দ্রুত অভিযোগ করুন।",
    "பணம் இழந்திருந்தால் வங்கிக்குத் தெரிவித்து கீழுள்ள அதிகாரப்பூர்வ வழிகளில் உடனே புகாரளியுங்கள்.",
  ],
  "A familiar name is not proof": ["পরিচিত নাম পরিচয়ের প্রমাণ নয়", "தெரிந்த பெயர் மட்டும் அடையாளத்திற்குச் சான்றல்ல"],
  "An unexpected message can copy a real company’s branding or a friend’s profile picture. Verify the request through a contact you already trust, rather than the number or link in that message.": [
    "অপ্রত্যাশিত বার্তায় আসল সংস্থার লোগো বা বন্ধুর ছবি নকল করা হতে পারে। বার্তার নম্বর বা লিঙ্কের বদলে আগে থেকেই বিশ্বস্ত যোগাযোগের মাধ্যমে যাচাই করুন।",
    "எதிர்பாராத செய்தி உண்மையான நிறுவனத்தின் சின்னத்தையோ நண்பரின் படத்தையோ நகலெடுக்கலாம். செய்தியின் எண் அல்லது இணைப்பைப் பயன்படுத்தாமல் ஏற்கெனவே நம்பும் தொடர்பு வழியில் சரிபாருங்கள்.",
  ],
  "Open the service directly using its official app or a trusted bookmark.": [
    "অফিসিয়াল অ্যাপ বা বিশ্বস্ত বুকমার্ক থেকে পরিষেবাটি সরাসরি খুলুন।",
    "அதிகாரப்பூர்வச் செயலி அல்லது நம்பகமான புக்மார்க்கில் சேவையை நேரடியாகத் திறக்கவும்.",
  ],
  "Keep the original message, sender address and time received.": [
    "মূল বার্তা, প্রেরকের ঠিকানা ও পাওয়ার সময় রাখুন।",
    "அசல் செய்தி, அனுப்புநரின் முகவரி, வந்த நேரம் ஆகியவற்றைச் சேமியுங்கள்.",
  ],
  "Never send passwords or verification codes in a reply.": ["উত্তরে কখনো পাসওয়ার্ড বা যাচাইকরণ কোড পাঠাবেন না।", "பதிலில் கடவுச்சொல் அல்லது சரிபார்ப்புக் குறியீட்டை அனுப்பாதீர்கள்."],
  "Take back control of access": ["অ্যাকাউন্টের নিয়ন্ত্রণ ফিরে পান", "கணக்கின் அணுகலை மீட்டெடுங்கள்"],
  "Account recovery should start inside the service’s official app or website. Someone offering to restore access through a private message may be asking for the very codes that protect your account.": [
    "অফিসিয়াল অ্যাপ বা ওয়েবসাইট থেকে অ্যাকাউন্ট পুনরুদ্ধার শুরু করুন। ব্যক্তিগত বার্তায় সাহায্যের নামে কেউ আপনার অ্যাকাউন্ট সুরক্ষার কোড চাইতে পারে।",
    "அதிகாரப்பூர்வச் செயலி அல்லது வலைத்தளத்தில் மீட்பைத் தொடங்குங்கள். தனிச் செய்தியில் அணுகலை மீட்டுத் தருவதாகக் கூறுபவர் கணக்கைப் பாதுகாக்கும் குறியீட்டைக் கேட்கலாம்.",
  ],
  "Use the provider’s recovery process from a trusted device.": ["বিশ্বস্ত ডিভাইস থেকে অফিসিয়াল পুনরুদ্ধার পদ্ধতি ব্যবহার করুন।", "நம்பகமான சாதனத்திலிருந்து சேவையின் மீட்பு முறையைப் பயன்படுத்துங்கள்."],
  "Review signed-in devices and remove sessions you do not recognize.": ["সংযুক্ত ডিভাইসগুলো দেখে অচেনা সেশন বন্ধ করুন।", "இணைக்கப்பட்ட சாதனங்களைப் பார்த்து, அறிமுகமற்ற அமர்வுகளிலிருந்து வெளியேறுங்கள்."],
  "After recovery, use a unique password and enable two-step verification.": ["ফিরে পেলে আলাদা পাসওয়ার্ড দিন এবং দুই ধাপের যাচাই চালু করুন।", "மீட்டதும் தனித்துவமான கடவுச்சொல்லைப் பயன்படுத்தி இருபடி சரிபார்ப்பை இயக்குங்கள்."],
  "Make your account easy to follow": ["ঘটনার বিবরণ সহজ করে লিখুন", "நிகழ்வு விவரங்களைத் தெளிவாக எழுதுங்கள்"],
  "A clear timeline connects what happened with the records you still have. Separate confirmed facts from estimates, and keep a note of anything you cannot remember instead of filling in the gaps.": [
    "সময় অনুযায়ী লিখলে ঘটনার সঙ্গে প্রমাণ মিলিয়ে দেখা যায়। নিশ্চিত তথ্য ও অনুমান আলাদা রাখুন। যা মনে নেই তা অজানা হিসেবে লিখুন।",
    "காலவரிசை நிகழ்வுகளை உங்களிடம் உள்ள ஆதாரங்களுடன் இணைக்கிறது. உறுதியான தகவல்களையும் ஊகங்களையும் பிரித்து, நினைவில் இல்லாததைத் தெரியவில்லை எனக் குறிப்பிடுங்கள்.",
  ],
  "Write the events in order, including approximate dates when necessary.": ["ঘটনাগুলো ক্রমানুসারে লিখুন। প্রয়োজন হলে আনুমানিক তারিখ দিন।", "நிகழ்வுகளை வரிசையாக எழுதுங்கள். தேவைப்பட்டால் தோராயமான தேதிகளைக் குறிப்பிடுங்கள்."],
  "Keep original messages and files privately; use redacted copies when sharing.": [
    "মূল বার্তা ও ফাইল ব্যক্তিগতভাবে রাখুন। কাউকে দেওয়ার কপিতে সংবেদনশীল তথ্য ঢেকে দিন।",
    "அசல் செய்திகளையும் கோப்புகளையும் தனிப்பட்ட முறையில் வைத்திருங்கள். பகிரும் நகலில் ரகசிய விவரங்களை மறையுங்கள்.",
  ],
  "Keep any report acknowledgement with your incident records.": ["অভিযোগের স্বীকৃতিপত্র ঘটনার নথির সঙ্গে রাখুন।", "புகார் ஏற்கப்பட்டதற்கான சான்றை நிகழ்வுப் பதிவுகளுடன் வைத்திருங்கள்."],
};

export function awarenessText(lang, en, hi, pa, bengali, tamil) {
  const extra = translatedLabels[en];
  return { hi, pa, "hi-Latn": hinglishUi[en], bn: bengali || extra?.[0], ta: tamil || extra?.[1] }[lang] || en;
}

export function guideCopy(slug, lang) {
  if (guideTranslations[lang]) return guideTranslations[lang][slug];
  const offset = { hi: 1, pa: 2 }[lang] || 0;
  return guides[slug].filter((_, index) => index % 3 === offset);
}

export function awarenessPath({ slug, group, lang } = {}) {
  const query = new URLSearchParams();
  if (group && group !== "all") query.set("group", group);
  if (lang) query.set("lang", lang);
  const path = slug ? "/awareness/" + slug : "/awareness";
  return query.size ? path + "?" + query : path;
}
