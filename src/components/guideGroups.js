import { WalletCards, MailWarning, Fingerprint, NotebookPen } from "lucide-react";

export const groups = {
  money: [WalletCards, "Money & payments", "पैसे और भुगतान", "ਪੈਸੇ ਅਤੇ ਭੁਗਤਾਨ"],
  messages: [
    MailWarning,
    "Messages & calls",
    "संदेश और कॉल",
    "ਸੁਨੇਹੇ ਅਤੇ ਕਾਲਾਂ",
  ],
  accounts: [Fingerprint, "Account security", "खाता सुरक्षा", "ਖਾਤਾ ਸੁਰੱਖਿਆ"],
  reporting: [
    NotebookPen,
    "Evidence & reporting",
    "साक्ष्य और रिपोर्टिंग",
    "ਸਬੂਤ ਅਤੇ ਰਿਪੋਰਟਿੰਗ",
  ],
};
