// Specific questions sit between the common incident and follow-up sections.
export const schemas = {
  payment: [
    "amount",
    "transactionDate",
    "reference",
    "recipient",
    "bank",
    "reported",
  ],
  phishing: ["method", "sender", "disclosed", "loss"],
  identity: ["misuse", "source", "impact"],
  social: ["account", "recovery", "activity"],
  shopping: ["orderDate", "amount", "seller", "paymentMethod", "reference"],
  job: ["recruiter", "promise", "fee"],
  harassment: ["channel", "frequency", "safety"],
  investment: ["scheme", "promise", "amount", "withdrawal"],
  blackmail: ["threat", "demand", "safety"],
  other: ["impact"],
};

export const patterns = {
  blackmail:
    /sextortion|blackmail|extort|\bfirauti\b|private (?:photo|video)|ब्लैकमेल|फिरौती|ਬਲੈਕਮੇਲ|ਫਿਰੌਤੀ/giu,
  investment:
    /invest(?:ment|ed|ing)?|crypto|\bnivesh\b|stock trading|निवेश|ट्रेडिंग|ਨਿਵੇਸ਼|ਨਿਵੇਸ਼|ਟ੍ਰੇਡਿੰਗ/giu,
  job: /recruit(?:er|ment)?|job|hiring|\b(?:naukri|bharti)\b|नौकरी|भर्ती|ਨੌਕਰੀ|ਭਰਤੀ/giu,
  shopping:
    /shopping|seller|order(?:ed)?|merchant|\bkharidari\b|खरीद|ऑर्डर|विक्रेता|ਖਰੀਦ|ਆਰਡਰ|ਵਿਕਰੇਤਾ/giu,
  social: /hack(?:ed|ing)?|locked out|account takeover|हैक|हैकिंग|ਹੈਕ/giu,
  phishing:
    /phish(?:ing)?|suspicious link|fake link|\bnakli link\b|clicked|फ़िशिंग|फिशिंग|संदिग्ध लिंक|ਫਿਸ਼ਿੰਗ|ਸ਼ੱਕੀ ਲਿੰਕ/giu,
  identity:
    /impersonat(?:e|ion|ing)|identity theft|stole my identity|in my name|\bmere naam se\b|पहचान की चोरी|मेरे नाम|ਪਛਾਣ ਦੀ ਚੋਰੀ|ਮੇਰੇ ਨਾਮ/giu,
  harassment:
    /bully(?:ing)?|harass(?:ment|ed)?|abuse|\bpareshan\b|stalk(?:ing)?|उत्पीड़न|परेशान|ਧੱਕੇਸ਼ਾਹੀ|ਤੰਗ|ਪਰੇਸ਼ਾਨ/giu,
  payment:
    /\bupi\b|payment|transfer(?:red)?|transaction|debited|\bpaise (?:kat gaye|bheje)\b|भुगतान|यूपीआई|लेनदेन|ਭੁਗਤਾਨ|ਯੂਪੀਆਈ|ਲੈਣ-ਦੇਣ/giu,
};
