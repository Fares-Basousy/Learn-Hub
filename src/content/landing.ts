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

export type OrgSection = {
  id: string;
  name: string;
  name_ar?: string;
  subject: string;
  subject_ar?: string;
  description: string;
  description_ar?: string;
  image: string;
};

export const orgSections: OrgSection[] = [
  {
    id: "org-1",
    name: "Al-Noor Academy",
    name_ar: "أكاديمية النور",
    subject: "Mathematics & Sciences",
    subject_ar: "الرياضيات والعلوم",
    description:
      "A partner school focused on STEM education for grades 7–12. Curriculum includes physics, chemistry, and advanced mathematics.",
    description_ar:
      "مدرسة شريكة تركز على تعليم العلوم والتقنية والرياضيات للصفوف 7–12، وتشمل الفيزياء والكيمياء والرياضيات المتقدمة.",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80",
  },
  {
    id: "org-2",
    name: "Bright Future Institute",
    name_ar: "معهد المستقبل المشرق",
    subject: "Languages & Humanities",
    subject_ar: "اللغات والعلوم الإنسانية",
    description:
      "Language-first program covering Arabic, English, and French, plus history and civics tracks.",
    description_ar:
      "برنامج يركّز على اللغات ويشمل العربية والإنجليزية والفرنسية، إضافةً إلى مسارات التاريخ والتربية الوطنية.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80",
  },
  {
    id: "org-3",
    name: "Cedar High",
    name_ar: "ثانوية الأرز",
    subject: "General Curriculum",
    subject_ar: "المنهج العام",
    description:
      "Full national curriculum from primary to secondary levels with an emphasis on well-rounded learning.",
    description_ar:
      "منهج وطني كامل من المرحلة الابتدائية إلى الثانوية مع التركيز على التعلّم الشامل.",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80",
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
    label: "About",
    label_ar: "من نحن",
    href: "/about",
    description: "Who we are",
    description_ar: "من نحن",
  },
  {
    label: "Contact",
    label_ar: "اتصل بنا",
    href: "/contact",
    description: "Get in touch",
    description_ar: "تواصل معنا",
  },
];
