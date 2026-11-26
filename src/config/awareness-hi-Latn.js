const guides = {
  "payment-and-investment-fraud": [
    "Payment aur investment mein fraud",
    "Paise bhejne se pehle khud check karein ki woh kiske paas jaayenge. Receipts, transaction IDs aur returns ke vaade save karein.",
    "Refund lene ke liye UPI PIN maanga jaaye toh satark rahein. Guaranteed investment returns ke vaadon ko dhyaan se jaanchein.",
    "Har payment ki date, amount, tareeqa, reference aur app mein dikhe recipient ki details alag likhein. Offer ka ad aur withdrawal ya refund ke liye ki gayi maang bhi rakhein."
  ],
  "phishing-and-identity-theft": [
    "Phishing aur pehchaan ki chori",
    "Service ko trusted bookmark se kholein. Original message aur sender ki details rakhein.",
    "Achanak aaya link agar password ya OTP maange, toh woh fake login page khol sakta hai.",
    "Kis tarah ki jaankari share ki thi, use note karein. Complaint mein asli password ya code na likhein. Website ka address aur original email save karein. Password share hua ho toh asli service par badlein aur jahan bhi wahi password use kiya tha, un accounts ko check karein."
  ],
  "social-account-security": [
    "Social media account hack ho jaaye toh",
    "Platform ka recovery page kholein. Doosri jagah bhi use kiye gaye passwords badlein aur signed-in devices check karein.",
    "Anjaan login alerts ya aapke account se aise messages jaana jo aapne nahi bheje, hacking ke sanket ho sakte hain.",
    "Login alerts save karein aur aakhri baar kab access tha, likhein. Access milne par recovery contacts, posts aur messages check karein. Agar account se paise maange gaye the toh apne contacts ko batayein."
  ],
  "shopping-and-job-scams": [
    "Shopping aur naukri ke scams",
    "Paise dene se pehle seller ya recruiter ki alag se jaanch karein. Listing aur order confirmation sambhal kar rakhein.",
    "Recruiter pehle hi fees maange ya seller platform ke bahar payment par zor de toh pehle verify karein.",
    "Listing ka address, seller ya recruiter ki profile, order ya offer aur receipts rakhein. Di hui rakam ko vaade ki salary, refund ya reward se alag likhein. Saamaan ya service mili ya nahi, yeh bhi likhein."
  ],
  "harassment-and-blackmail": [
    "Online pareshaani aur blackmail",
    "Dhamki wale messages aur usernames save karein. Turant khatra ho toh local police se madad lein.",
    "Agar koi paise na dene par private photos ya messages public karne ki dhamki de, toh yeh blackmail hai.",
    "Account ka naam, profile address, dates aur exact maang likhein. Original messages private rakhein. Sensitive material upload kiye bina bhi uske baare mein bata sakte hain."
  ],
  "qr-refund": [
    "QR code aur refund ki request",
    "Payment app ki aakhri screen par check karein ki paisa ja raha hai ya aa raha hai, kitna hai aur kiske paas jaayega. Anchaahi payment request band karein.",
    "Buyer kehta hai ki payment ho gaya, lekin paisa paane ke liye QR code bhejta hai. App mein dekhein ki kahin paisa kat toh nahi raha.",
    "Payment request, chat aur transaction reference save karein. Balance apne banking app mein check karein."
  ],
  "remote-support": [
    "Fake tech support",
    "Achanak aayi support call band karein. Service ka app khud kholkar usmein di hui support team se baat karein.",
    "Caller bank mein login ya payment approve karte waqt screen share karne ko kahe toh satark rahein.",
    "Access diya ho toh session band karein. Trusted device se account activity check karein aur anjaan sessions ka access hata dein."
  ],
  "parcel-texts": [
    "Parcel aur delivery ke messages",
    "Retailer ke app mein order check karein. Order confirmation mein mila tracking number use karein.",
    "Message kehta hai delivery fail ho gayi aur anjaan link par chhoti fees maangta hai. Page poori card details maang sakta hai.",
    "Message aur sender ki details rakhein. Card details daali hain toh card par diye number se issuer ko contact karein."
  ],
  "impersonation": [
    "Dost achanak paise maange toh",
    "Us vyakti ko pehle se maloom number par call karein. Paise bhejne ya code batane se pehle request confirm karein.",
    "Koi dost ki profile photo laga kar kehta hai number badal gaya hai aur payment ko secret rakhne ko bolta hai.",
    "Asli dost ko doosre channel se batayein. Report karne se pehle fake profile ka address save karein."
  ],
  "task-jobs": [
    "Paid tasks aur naukri ke liye deposit",
    "Employer ke apne careers page par vacancy dekhein. Employer ka contact khud dhoondhkar baat karein.",
    "Group kuch reviews ke paise deta hai, phir bada task kholne ya kamaai nikaalne ke liye deposit maangta hai.",
    "Job ad, group ka naam aur receipts rakhein. Aapne kitne paise diye, use screen par dikhe balance se alag likhein."
  ],
  "account-recovery": [
    "Email account wapas kaise paayein",
    "Trusted device se provider ka asli sign-in page kholein aur recovery shuru karein. Access milne par recovery addresses aur mail forwarding rules check karein.",
    "Reset emails gaayab hon ya recovery address achanak badal jaaye toh ho sakta hai koi aapke email se doosre accounts reset kar raha ho.",
    "Anjaan devices ko sign out karein. Unique password rakhein, multi-factor authentication on karein aur recovery codes private rakhein."
  ],
  "evidence-timeline": [
    "Ghatna ki timeline kaise banayein",
    "Pehla contact kab hua, kya maanga gaya, aapne kya kiya aur dikkat kab dikhi, yeh likhein. Andaazatan time ko saaf mark karein.",
    "Date ya profile address ke bina baad mein screenshot ko sahi chat se jodna mushkil ho sakta hai.",
    "Originals private rakhein. Share karne wali copies mein sensitive details chhupa dein. Likhein ki kaunsi receipt ya screenshot kis ghatna se juda hai."
  ],
  "recovery-fees": [
    "Scam ke baad paise wapas dilaane ke offers",
    "Naye offer ki pushti usi bank ya official channel se karein jahan aapne pehle report ki thi.",
    "Koi anjaan vyakti aapka pehle ka nuksaan jaanta hai aur advance fees lekar refund ka vaada karta hai. Sirf details jaanna uske adhikaar ka saboot nahi hai.",
    "Nayi maang ko pehli report ke saath rakhein. Naye contact ki details alag likhein taaki dono ghatnayein saaf rahein."
  ],
  "digital-arrest": [
    "Digital arrest aur fake police calls",
    "Call band karein. Official contact khud dhoondhkar daave ki pushti karein.",
    "Caller kahe ki video par bane rehna hai, call secret rakhni hai ya case band karne ke liye paise bhejne hain, toh satark rahein.",
    "Paise na bhejein, screen share na karein aur codes na dein. Call log aur messages rakhein. Paise bhej diye hain toh turant bank ko batayein aur India mein 1930 par call karein."
  ],
  "voice-cloning": [
    "AI se awaaz ki nakal wale scams",
    "Jaani-pehchaani awaaz emergency mein paise maange toh call band karein. Us vyakti ko pehle se saved number par khud call karein.",
    "Jaldi karne ka dabaav, baat chhupaane ko kehna aur anjaan vyakti ko paise bhejne ki maang khatre ke sanket hain, chahe awaaz asli lage.",
    "Contact na ho paaye toh kisi bharosemand dost ya rishtedaar se poochhein. Voicemail aur caller details sambhal kar rakhein. Alag se pushti hone par hi paise bhejein."
  ],
  "sim-swap": [
    "SIM swap ke sanket",
    "Phone ka signal achanak chala jaaye aur nayi SIM activate hone ka notice mile toh seedhe apne mobile operator se baat karein.",
    "Signal kai wajah se ja sakta hai. Aapne SIM change nahi maanga phir bhi notice ya anjaan account reset mile toh turant check karein.",
    "Doosre trusted phone se operator ko call karein. Number wapas milne par email aur zaroori accounts secure karein aur recent activity dekhein. Anjaan bank transactions turant bank ko batayein."
  ],
  "fake-apps": [
    "Fake apps aur APK downloads",
    "Message mein Android app ki file mile toh official website ya app store se service dhoondhein.",
    "Bank ya delivery service ban kar koi chat se file install karne ya unknown sources ki setting on karne ko kahe toh satark rahein.",
    "File na kholein aur message saboot ke liye rakhein. App install kar liya ho toh us device par banking se bachein. Doosre trusted device se bank ko contact karein aur jo passwords daale the unhe badlein."
  ]
};

export default guides;
