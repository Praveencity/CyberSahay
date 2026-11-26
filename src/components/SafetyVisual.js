import {
  CirclePause,
  ClipboardList,
  FileCheck2,
  FolderLock,
  KeyRound,
  Landmark,
  ListChecks,
  PhoneOff,
  ScanSearch,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

const steps = {
  overview: [
    [CirclePause, "Pause before responding", "जवाब देने से पहले रुकें", "ਜਵਾਬ ਦੇਣ ਤੋਂ ਪਹਿਲਾਂ ਰੁਕੋ", "জবাব দেওয়ার আগে থামুন", "பதிலளிக்கும் முன் நிதானியுங்கள்"],
    [ScanSearch, "Verify through a trusted contact", "विश्वसनीय संपर्क से पुष्टि करें", "ਭਰੋਸੇਯੋਗ ਸੰਪਰਕ ਤੋਂ ਪੁਸ਼ਟੀ ਕਰੋ", "বিশ্বস্ত মাধ্যমে যাচাই করুন", "நம்பகமான தொடர்பு வழியில் சரிபாருங்கள்"],
    [FolderLock, "Keep the original evidence", "मूल साक्ष्य सुरक्षित रखें", "ਅਸਲ ਸਬੂਤ ਸੰਭਾਲੋ", "মূল প্রমাণ রাখুন", "அசல் ஆதாரத்தைச் சேமியுங்கள்"],
  ],
  money: [
    [CirclePause, "Stop further payments", "आगे के भुगतान रोकें", "ਹੋਰ ਭੁਗਤਾਨ ਰੋਕੋ", "আর টাকা পাঠাবেন না", "மேலும் பணம் செலுத்தாதீர்கள்"],
    [Landmark, "Contact your bank", "अपने बैंक से संपर्क करें", "ਆਪਣੇ ਬੈਂਕ ਨਾਲ ਸੰਪਰਕ ਕਰੋ", "নিজের ব্যাংকে জানান", "உங்கள் வங்கியை அணுகுங்கள்"],
    [WalletCards, "Save transaction references", "लेनदेन संदर्भ सहेजें", "ਲੈਣ-ਦੇਣ ਹਵਾਲੇ ਸੰਭਾਲੋ", "লেনদেন নম্বর রাখুন", "பரிவர்த்தனை எண்களைச் சேமியுங்கள்"],
  ],
  messages: [
    [PhoneOff, "End the suspicious contact", "संदिग्ध संपर्क रोकें", "ਸ਼ੱਕੀ ਸੰਪਰਕ ਬੰਦ ਕਰੋ", "সন্দেহজনক যোগাযোগ থামান", "சந்தேகமான தொடர்பைத் துண்டியுங்கள்"],
    [ScanSearch, "Check via a known number or app", "ज्ञात नंबर या ऐप से जाँचें", "ਜਾਣੇ ਨੰਬਰ ਜਾਂ ਐਪ ਤੋਂ ਜਾਂਚੋ", "পরিচিত নম্বর বা অ্যাপে যাচাই করুন", "தெரிந்த எண் அல்லது செயலியில் சரிபாருங்கள்"],
    [FolderLock, "Save the message or call details", "संदेश या कॉल का विवरण रखें", "ਸੁਨੇਹਾ ਜਾਂ ਕਾਲ ਦੇ ਵੇਰਵੇ ਰੱਖੋ", "বার্তা বা কলের বিবরণ রাখুন", "செய்தி அல்லது அழைப்பு விவரங்களைச் சேமியுங்கள்"],
  ],
  accounts: [
    [ShieldCheck, "Switch to a trusted device", "विश्वसनीय उपकरण इस्तेमाल करें", "ਭਰੋਸੇਯੋਗ ਉਪਕਰਨ ਵਰਤੋ", "বিশ্বস্ত ডিভাইস ব্যবহার করুন", "நம்பகமான சாதனத்தைப் பயன்படுத்துங்கள்"],
    [KeyRound, "Use official recovery or support", "आधिकारिक रिकवरी या सहायता लें", "ਅਧਿਕਾਰਤ ਰਿਕਵਰੀ ਜਾਂ ਮਦਦ ਲਵੋ", "অফিসিয়াল সহায়তা বা পুনরুদ্ধার ব্যবহার করুন", "அதிகாரப்பூர்வ மீட்பு அல்லது உதவியைப் பயன்படுத்துங்கள்"],
    [ListChecks, "Review devices and recent activity", "उपकरण और हाल की गतिविधि देखें", "ਉਪਕਰਨ ਅਤੇ ਹਾਲੀਆ ਸਰਗਰਮੀ ਵੇਖੋ", "ডিভাইস ও সাম্প্রতিক কাজ দেখুন", "சாதனங்களையும் சமீபத்திய செயல்பாடுகளையும் பாருங்கள்"],
  ],
  reporting: [
    [FolderLock, "Preserve originals privately", "मूल साक्ष्य निजी तौर पर रखें", "ਅਸਲ ਸਬੂਤ ਨਿੱਜੀ ਰੱਖੋ", "মূল প্রমাণ ব্যক্তিগতভাবে রাখুন", "அசல் ஆதாரங்களைத் தனிப்பட்ட முறையில் வையுங்கள்"],
    [ClipboardList, "Write a timeline of events", "घटनाएँ समय के क्रम में लिखें", "ਘਟਨਾਵਾਂ ਸਮੇਂ ਦੇ ਕ੍ਰਮ ਨਾਲ ਲਿਖੋ", "ঘটনাগুলো সময়ের ক্রমে লিখুন", "நிகழ்வுகளைக் காலவரிசையில் எழுதுங்கள்"],
    [FileCheck2, "Report and keep the reference", "रिपोर्ट करें और संदर्भ रखें", "ਰਿਪੋਰਟ ਕਰੋ ਅਤੇ ਹਵਾਲਾ ਸੰਭਾਲੋ", "অভিযোগ করুন এবং নম্বরটি রাখুন", "புகாரளித்து அதன் எண்ணைச் சேமியுங்கள்"],
  ],
};

export function SafetyDiagram({ t, group = "overview" }) {
  return (
    <ol className="safety-diagram" role="list">
      {steps[group].map(([Icon, ...label]) => (
        <li key={label[0]}>
          <span><Icon size={22} aria-hidden="true" /></span>
          <strong>{t(...label)}</strong>
        </li>
      ))}
    </ol>
  );
}
