export const photographers = [
  {
    id: "ph-krak-001",
    fullName: "Anna Kowalska",
    city: "Kraków",
    bio: "Specjalistka od reportażu rodzinnego i sesji plenerowych.",
    rating: 4.9,
    reviewCount: 42,
    verificationLevel: "video_call",
    heroImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
    specialties: ["Sesje rodzinne", "Wieczory panieńskie", "Eventy"],
    packages: [
      {
        id: "pkg-anna-1",
        name: "Mini sesja plenerowa",
        pricePln: 350,
        description: "45 minut fotografowania, 15 zdjęć po autorskiej obróbce.",
      },
      {
        id: "pkg-anna-2",
        name: "Reportaż rodzinny",
        pricePln: 690,
        description: "2 godziny, 40 zdjęć, galeria online na 60 dni.",
      }
    ],
    travelPolicy: {
      includedKm: 15,
      extraKmPrice: 2.5,
    },
    availability: {
      "2025-10-10": ["10:00", "12:00", "15:30"],
      "2025-10-11": ["09:00", "13:00"],
      "2025-10-15": ["17:30"],
    },
    testimonials: [
      {
        author: "Karolina",
        rating: 5,
        quote: "Wspaniała atmosfera, zdjęcia przyszły już po dwóch dniach!"
      },
      {
        author: "Michał",
        rating: 5,
        quote: "Profesjonalne podejście i duża elastyczność przy rezerwacji."
      }
    ]
  },
  {
    id: "ph-tor-002",
    fullName: "Piotr Nowak",
    city: "Toruń",
    bio: "Fotograf ślubny i okolicznościowy, łączy reportaż z filmowaniem.",
    rating: 4.7,
    reviewCount: 31,
    verificationLevel: "id_check",
    heroImage: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80",
    specialties: ["Śluby", "Chrzciny", "Sesje narzeczeńskie"],
    packages: [
      {
        id: "pkg-piotr-1",
        name: "Ceremonia + mini plener",
        pricePln: 1200,
        description: "Reportaż z ceremonii i mini sesja plenerowa, 80 zdjęć."
      },
      {
        id: "pkg-piotr-2",
        name: "Cały dzień ślubu",
        pricePln: 3200,
        description: "Od przygotowań do oczepin, 300 zdjęć, fotoksiążka 30x30cm."
      }
    ],
    travelPolicy: {
      includedKm: 30,
      extraKmPrice: 2.2,
    },
    availability: {
      "2025-10-12": ["11:00", "15:00"],
      "2025-10-18": ["09:00"],
      "2025-10-19": ["09:00", "12:00", "18:00"],
    },
    testimonials: [
      {
        author: "Julia",
        rating: 5,
        quote: "Piękne zdjęcia, złapał wszystkie ważne momenty."
      },
      {
        author: "Marcin",
        rating: 4,
        quote: "Świetny kontakt i pomysły na ujęcia."
      }
    ]
  },
  {
    id: "ph-gda-003",
    fullName: "Magda Zielińska",
    city: "Gdańsk",
    bio: "Lifestyle i sesje biznesowe dla małych firm i freelancerów.",
    rating: 4.8,
    reviewCount: 19,
    verificationLevel: "video_call",
    heroImage: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80",
    specialties: ["Sesje wizerunkowe", "Content na social media", "Eventy firmowe"],
    packages: [
      {
        id: "pkg-magda-1",
        name: "Wizerunkowa w biurze",
        pricePln: 890,
        description: "Sesja 3h, 25 zdjęć, konsultacja stylizacyjna online."
      },
      {
        id: "pkg-magda-2",
        name: "Dzień zdjęciowy content",
        pricePln: 1650,
        description: "6h zdjęć, 80 ujęć do social mediów, format pion/poziom."
      }
    ],
    travelPolicy: {
      includedKm: 20,
      extraKmPrice: 3.0,
    },
    availability: {
      "2025-10-09": ["09:00", "13:00"],
      "2025-10-10": ["10:00", "16:00"],
      "2025-10-14": ["12:00"],
    },
    testimonials: [
      {
        author: "Ewelina",
        rating: 5,
        quote: "Zdjęcia gotowe w tydzień, pięknie oddały klimat biura."
      },
      {
        author: "Adam",
        rating: 5,
        quote: "Magda prowadzi przez cały proces, super doświadczenie."
      }
    ]
  }
];

export function findPhotographer(id) {
  return photographers.find((item) => item.id === id);
}

export function getAvailability(id) {
  const photographer = findPhotographer(id);
  return photographer ? photographer.availability : null;
}
