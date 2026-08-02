// Placeholder content for the public landing page.
// Edit these arrays to change what shows up on `/`.

export type HeroSlide = {
  src: string;
  alt: string;
  alt_ar?: string;
};

export const heroSlides: HeroSlide[] = [
  {
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80",
    alt: "Classroom with students",
    alt_ar: "فصل دراسي مع الطلاب",
  },
  {
    src: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1920&q=80",
    alt: "Stack of books",
    alt_ar: "مجموعة من الكتب",
  },
  {
    src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&q=80",
    alt: "Study desk with notebook",
    alt_ar: "مكتب دراسة مع دفتر",
  },
];

export type Shortcut = {
  label: string;
  label_ar?: string;
  href: string;
  description: string;
  description_ar?: string;
};

export const shortcuts: Shortcut[] = [
  {
    label: "Timetable",
    label_ar: "الجدول",
    href: "#timetable",
    description: "See this week's schedule",
    description_ar: "شاهد جدول هذا الأسبوع",
  },
  {
    label: "Organizations",
    label_ar: "المؤسسات",
    href: "#organizations",
    description: "Partner schools",
    description_ar: "المدارس الشريكة",
  },
  {
    label: "Contact",
    label_ar: "اتصل بنا",
    href: "/contact",
    description: "Get in touch",
    description_ar: "تواصل معنا",
  },
];
