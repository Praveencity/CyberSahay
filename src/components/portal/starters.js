import { Fingerprint, MailWarning, WalletCards } from "lucide-react";

export const starters = [
  { id: "payment", topic: "money", Icon: WalletCards, title: "starterPayment", prompt: "promptPayment" },
  { id: "message", topic: "messages", Icon: MailWarning, title: "starterMessage", prompt: "promptMessage" },
  { id: "account", topic: "accounts", Icon: Fingerprint, title: "starterAccount", prompt: "promptAccount" },
];
