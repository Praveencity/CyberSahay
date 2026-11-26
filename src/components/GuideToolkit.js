"use client";
import { useState } from "react";
import { Check, ClipboardCheck, Lightbulb } from "lucide-react";
import { SafetyDiagram } from "./SafetyVisual";

const advice = {
  money: [
    ["Check before approving a payment", "भुगतान से पहले जाँचें", "ਭੁਗਤਾਨ ਤੋਂ ਪਹਿਲਾਂ ਜਾਂਚੋ"],
    ["A familiar logo or a screenshot of a successful payment does not confirm that money reached your account. Open your own bank or payment app to check the transaction.", "परिचित लोगो या सफल भुगतान का स्क्रीनशॉट आपके खाते में पैसे आने की पुष्टि नहीं करता। अपने बैंक या भुगतान ऐप में लेनदेन जाँचें।", "ਜਾਣਿਆ ਲੋਗੋ ਜਾਂ ਸਫਲ ਭੁਗਤਾਨ ਦਾ ਸਕ੍ਰੀਨਸ਼ਾਟ ਤੁਹਾਡੇ ਖਾਤੇ ਵਿੱਚ ਪੈਸੇ ਆਉਣ ਦੀ ਪੁਸ਼ਟੀ ਨਹੀਂ ਕਰਦਾ। ਆਪਣੇ ਬੈਂਕ ਜਾਂ ਭੁਗਤਾਨ ਐਪ ਵਿੱਚ ਲੈਣ-ਦੇਣ ਵੇਖੋ।"],
    ["Read the amount, recipient and payment direction on your own app.", "अपने ऐप में राशि, प्राप्तकर्ता और भुगतान की दिशा पढ़ें।", "ਆਪਣੇ ਐਪ ਵਿੱਚ ਰਕਮ, ਪ੍ਰਾਪਤਕਰਤਾ ਅਤੇ ਭੁਗਤਾਨ ਦੀ ਦਿਸ਼ਾ ਪੜ੍ਹੋ।"],
    ["Do not enter a UPI PIN to receive money or a refund.", "पैसे या रिफंड पाने के लिए UPI पिन न डालें।", "ਪੈਸੇ ਜਾਂ ਰਿਫੰਡ ਲੈਣ ਲਈ UPI ਪਿੰਨ ਨਾ ਪਾਓ।"],
    ["If money was lost, contact your bank and report promptly using the official channels below.", "पैसे खोए हों तो बैंक से संपर्क करें और नीचे दिए आधिकारिक माध्यमों से तुरंत रिपोर्ट करें।", "ਪੈਸੇ ਗੁਆਏ ਹੋਣ ਤਾਂ ਬੈਂਕ ਨਾਲ ਸੰਪਰਕ ਕਰੋ ਅਤੇ ਹੇਠਲੇ ਅਧਿਕਾਰਤ ਮਾਧਿਅਮਾਂ ਰਾਹੀਂ ਤੁਰੰਤ ਰਿਪੋਰਟ ਕਰੋ।"],
  ],
  messages: [
    ["A familiar name is not proof", "परिचित नाम प्रमाण नहीं है", "ਜਾਣਿਆ ਨਾਂ ਸਬੂਤ ਨਹੀਂ ਹੈ"],
    ["An unexpected message can copy a real company’s branding or a friend’s profile picture. Verify the request through a contact you already trust, rather than the number or link in that message.", "अनचाहा संदेश असली कंपनी का लोगो या दोस्त की तस्वीर इस्तेमाल कर सकता है। संदेश के नंबर या लिंक के बजाय पहले से विश्वसनीय संपर्क से पुष्टि करें।", "ਅਣਚਾਹਿਆ ਸੁਨੇਹਾ ਅਸਲ ਕੰਪਨੀ ਦਾ ਲੋਗੋ ਜਾਂ ਦੋਸਤ ਦੀ ਤਸਵੀਰ ਵਰਤ ਸਕਦਾ ਹੈ। ਸੁਨੇਹੇ ਦੇ ਨੰਬਰ ਜਾਂ ਲਿੰਕ ਦੀ ਥਾਂ ਪਹਿਲਾਂ ਤੋਂ ਭਰੋਸੇਯੋਗ ਸੰਪਰਕ ਤੋਂ ਪੁਸ਼ਟੀ ਕਰੋ।"],
    ["Open the service directly using its official app or a trusted bookmark.", "आधिकारिक ऐप या विश्वसनीय बुकमार्क से सेवा खोलें।", "ਅਧਿਕਾਰਤ ਐਪ ਜਾਂ ਭਰੋਸੇਯੋਗ ਬੁੱਕਮਾਰਕ ਰਾਹੀਂ ਸੇਵਾ ਖੋਲ੍ਹੋ।"],
    ["Keep the original message, sender address and time received.", "मूल संदेश, प्रेषक का पता और मिलने का समय रखें।", "ਅਸਲ ਸੁਨੇਹਾ, ਭੇਜਣ ਵਾਲੇ ਦਾ ਪਤਾ ਅਤੇ ਮਿਲਣ ਦਾ ਸਮਾਂ ਰੱਖੋ।"],
    ["Never send passwords or verification codes in a reply.", "जवाब में पासवर्ड या सत्यापन कोड कभी न भेजें।", "ਜਵਾਬ ਵਿੱਚ ਪਾਸਵਰਡ ਜਾਂ ਤਸਦੀਕ ਕੋਡ ਕਦੇ ਨਾ ਭੇਜੋ।"],
  ],
  accounts: [
    ["Take back control of access", "खाते की पहुँच वापस लें", "ਖਾਤੇ ਦੀ ਪਹੁੰਚ ਮੁੜ ਲਵੋ"],
    ["Account recovery should start inside the service’s official app or website. Someone offering to restore access through a private message may be asking for the very codes that protect your account.", "खाता रिकवरी आधिकारिक ऐप या वेबसाइट से शुरू करें। निजी संदेश में पहुँच लौटाने का दावा करने वाला आपके खाते की सुरक्षा करने वाले कोड माँग सकता है।", "ਖਾਤਾ ਰਿਕਵਰੀ ਅਧਿਕਾਰਤ ਐਪ ਜਾਂ ਵੈੱਬਸਾਈਟ ਤੋਂ ਸ਼ੁਰੂ ਕਰੋ। ਨਿੱਜੀ ਸੁਨੇਹੇ ਵਿੱਚ ਪਹੁੰਚ ਵਾਪਸ ਦੇਣ ਦਾ ਦਾਅਵਾ ਕਰਨ ਵਾਲਾ ਤੁਹਾਡੇ ਖਾਤੇ ਦੀ ਸੁਰੱਖਿਆ ਵਾਲੇ ਕੋਡ ਮੰਗ ਸਕਦਾ ਹੈ।"],
    ["Use the provider’s recovery process from a trusted device.", "विश्वसनीय उपकरण से प्रदाता की रिकवरी प्रक्रिया इस्तेमाल करें।", "ਭਰੋਸੇਯੋਗ ਡਿਵਾਈਸ ਤੋਂ ਸੇਵਾ ਦੀ ਰਿਕਵਰੀ ਪ੍ਰਕਿਰਿਆ ਵਰਤੋ।"],
    ["Review signed-in devices and remove sessions you do not recognize.", "लॉग इन उपकरण जाँचें और अनजान सत्र हटाएँ।", "ਲੌਗਇਨ ਕੀਤੇ ਉਪਕਰਨ ਵੇਖੋ ਅਤੇ ਅਣਜਾਣ ਸੈਸ਼ਨ ਹਟਾਓ।"],
    ["After recovery, use a unique password and enable two-step verification.", "रिकवरी के बाद अलग पासवर्ड रखें और दो-चरणीय सत्यापन चालू करें।", "ਰਿਕਵਰੀ ਤੋਂ ਬਾਅਦ ਵੱਖਰਾ ਪਾਸਵਰਡ ਰੱਖੋ ਅਤੇ ਦੋ-ਪੜਾਵੀ ਤਸਦੀਕ ਚਾਲੂ ਕਰੋ।"],
  ],
  reporting: [
    ["Make your account easy to follow", "विवरण को स्पष्ट बनाएँ", "ਵੇਰਵੇ ਸਪਸ਼ਟ ਬਣਾਓ"],
    ["A clear timeline connects what happened with the records you still have. Separate confirmed facts from estimates, and keep a note of anything you cannot remember instead of filling in the gaps.", "स्पष्ट समयरेखा घटना और आपके रिकॉर्ड को जोड़ती है। पुष्ट तथ्यों और अनुमानों को अलग रखें। जो याद न हो उसे गढ़ने के बजाय अज्ञात लिखें।", "ਸਪਸ਼ਟ ਸਮਾਂ-ਰੇਖਾ ਘਟਨਾ ਅਤੇ ਤੁਹਾਡੇ ਰਿਕਾਰਡ ਨੂੰ ਜੋੜਦੀ ਹੈ। ਪੱਕੇ ਤੱਥਾਂ ਅਤੇ ਅੰਦਾਜ਼ਿਆਂ ਨੂੰ ਵੱਖ ਰੱਖੋ। ਜੋ ਯਾਦ ਨਾ ਹੋਵੇ ਉਸ ਨੂੰ ਬਣਾਉਣ ਦੀ ਥਾਂ ਅਣਜਾਣ ਲਿਖੋ।"],
    ["Write the events in order, including approximate dates when necessary.", "घटनाएँ क्रम में लिखें; ज़रूरत पर अनुमानित तारीख बताएँ।", "ਘਟਨਾਵਾਂ ਕ੍ਰਮ ਵਿੱਚ ਲਿਖੋ; ਲੋੜ ਪੈਣ ਤੇ ਅੰਦਾਜ਼ਨ ਤਾਰੀਖ ਦੱਸੋ।"],
    ["Keep original messages and files privately; use redacted copies when sharing.", "मूल संदेश और फ़ाइलें निजी रखें; साझा करते समय संवेदनशील अंश छिपाएँ।", "ਅਸਲ ਸੁਨੇਹੇ ਅਤੇ ਫ਼ਾਈਲਾਂ ਨਿੱਜੀ ਰੱਖੋ; ਸਾਂਝਾ ਕਰਦੇ ਸਮੇਂ ਸੰਵੇਦਨਸ਼ੀਲ ਹਿੱਸੇ ਢੱਕੋ।"],
    ["Keep any report acknowledgement with your incident records.", "रिपोर्ट की पावती घटना के रिकॉर्ड के साथ रखें।", "ਰਿਪੋਰਟ ਦੀ ਰਸੀਦ ਘਟਨਾ ਦੇ ਰਿਕਾਰਡ ਨਾਲ ਰੱਖੋ।"],
  ],
};
export default function GuideToolkit({ group, t }) {
  const content = advice[group];
  const [checked, setChecked] = useState([]);
  const items = content.slice(2);
  return <>
    <section className="guide-flow card" data-scroll-reveal id="safety-check">
      <h2>{t("A safer response", "सुरक्षित प्रतिक्रिया", "ਸੁਰੱਖਿਅਤ ਜਵਾਬ")}</h2>
      <SafetyDiagram t={t} group={group} />
    </section>
    <section className="guide-insight card">
      <Lightbulb size={23} />
      <div><h2>{t(...content[0])}</h2><p>{t(...content[1])}</p></div>
    </section>
    <section className="card guide-checklist" data-scroll-reveal id="action-checklist">
      <div className="section-heading"><h2><ClipboardCheck size={22} />{t("Your action checklist", "आपकी कार्य सूची", "ਤੁਹਾਡੀ ਕਾਰਵਾਈ ਸੂਚੀ")}</h2><span aria-live="polite">{checked.length} / {items.length}</span></div>
      <p>{t("Use this as a personal reminder. These checks stay on this page and are not a report.", "इसे निजी याददिहानी के लिए इस्तेमाल करें। ये चेक इसी पेज पर रहते हैं और रिपोर्ट नहीं हैं।", "ਇਸ ਨੂੰ ਨਿੱਜੀ ਯਾਦਦਿਹਾਨੀ ਵਜੋਂ ਵਰਤੋ। ਇਹ ਚੈੱਕ ਇਸੇ ਪੰਨੇ ਉੱਤੇ ਰਹਿੰਦੇ ਹਨ ਅਤੇ ਰਿਪੋਰਟ ਨਹੀਂ ਹਨ।")}</p>
      {items.map((item, i) => <label key={item[0]} className={checked.includes(i) ? "is-checked" : ""}>
        <input type="checkbox" checked={checked.includes(i)} onChange={(e) => setChecked(e.target.checked ? [...checked, i] : checked.filter((x) => x !== i))} />
        <span>{t(...item)}</span>{checked.includes(i) && <Check size={18} aria-hidden="true" />}
      </label>)}
    </section>
  </>;
}
