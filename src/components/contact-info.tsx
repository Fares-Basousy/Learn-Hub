import { MapPin, Phone } from "lucide-react";
import { contactInfo } from "@/content/contact";
import { useLang } from "@/components/lang-provider";

// Inline WhatsApp glyph (lucide has no whatsapp icon).
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.52 3.48A11.87 11.87 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.6 5.93L0 24l6.38-1.67a11.83 11.83 0 0 0 5.66 1.44h.01c6.54 0 11.84-5.3 11.84-11.84 0-3.16-1.23-6.13-3.37-8.45ZM12.05 21.3h-.01a9.44 9.44 0 0 1-4.81-1.32l-.35-.2-3.78.99 1.01-3.69-.23-.38a9.44 9.44 0 0 1-1.45-5.04c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.9.99 6.69 2.78a9.4 9.4 0 0 1 2.77 6.7c0 5.22-4.25 9.47-9.47 9.47Zm5.42-7.09c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47a8.9 8.9 0 0 1-1.65-2.05c-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.49 0 1.47 1.07 2.88 1.22 3.08.15.2 2.11 3.22 5.11 4.51.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

export function ContactInfoBlock() {
  const { lang, t } = useLang();
  const street = lang === "ar" ? contactInfo.street_ar ?? contactInfo.street : contactInfo.street;
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("address")}
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <div>{street}</div>
            <a
              href={contactInfo.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {t("openInMaps")}
            </a>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("callUs")}
        </div>
        <ul className="space-y-1.5">
          {contactInfo.phones.map((p) => (
            <li key={p.number} className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <a href={`tel:${p.number.replace(/\s+/g, "")}`} className="hover:underline">
                {p.number}
              </a>
              <span className="text-xs text-muted-foreground">
                · {lang === "ar" ? p.label_ar ?? p.label : p.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("whatsapp")}
        </div>
        <ul className="space-y-1.5">
          {contactInfo.whatsapp.map((w) => (
            <li key={w.number}>
              <a
                href={`https://wa.me/${w.number}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                <WhatsAppIcon className="h-4 w-4" />
                +{w.number}
                <span className="text-xs opacity-90">
                  · {lang === "ar" ? w.label_ar ?? w.label : w.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
