const LOCALES = ["fr", "en", "de", "it", "pl", "pt"];

const vehicleCopy = {
  fr: {
    tagline: "Découvrez Djerba à votre rythme.",
    description:
      "Explorez Djerba depuis la zone touristique. L'agence, fondée en 2023, se trouve en face de l'hôtel Zenon. Casque, antivol et assurance inclus ; prise en charge gratuite à l'hôtel et aucune caution demandée.",
    highlights: ["Casque, antivol et assurance inclus", "Prise en charge gratuite à l'hôtel", "Sans caution"],
  },
  en: {
    tagline: "Discover Djerba at your own pace.",
    description:
      "Explore Djerba from the island's tourist area. Founded in 2023, the agency is opposite Hotel Zenon. A helmet, anti-theft lock and insurance are included; hotel pick-up is free and no deposit is required.",
    highlights: ["Helmet, anti-theft lock and insurance included", "Free hotel pick-up", "No deposit"],
  },
  de: {
    tagline: "Entdecken Sie Djerba in Ihrem eigenen Tempo.",
    description:
      "Entdecken Sie Djerba von der Touristenzone der Insel aus. Die 2023 gegründete Agentur liegt gegenüber dem Hotel Zenon. Helm, Diebstahlsicherung und Versicherung sind inklusive; die Abholung am Hotel ist kostenlos und es ist keine Kaution erforderlich.",
    highlights: ["Helm, Diebstahlsicherung und Versicherung inklusive", "Kostenlose Abholung am Hotel", "Keine Kaution"],
  },
  it: {
    tagline: "Scopri Djerba al tuo ritmo.",
    description:
      "Esplora Djerba partendo dalla zona turistica dell'isola. Fondata nel 2023, l'agenzia si trova di fronte all'Hotel Zenon. Casco, antifurto e assicurazione sono inclusi; il ritiro in hotel è gratuito e non è richiesta alcuna cauzione.",
    highlights: ["Casco, antifurto e assicurazione inclusi", "Ritiro gratuito in hotel", "Nessuna cauzione"],
  },
  pl: {
    tagline: "Odkrywaj Dżerbę we własnym tempie.",
    description:
      "Odkrywaj Dżerbę, wyruszając ze strefy turystycznej wyspy. Agencja, założona w 2023 roku, znajduje się naprzeciwko hotelu Zenon. Kask, zabezpieczenie antykradzieżowe i ubezpieczenie są wliczone w cenę; odbiór z hotelu jest bezpłatny i nie jest wymagana kaucja.",
    highlights: ["Kask, zabezpieczenie antykradzieżowe i ubezpieczenie w cenie", "Bezpłatny odbiór z hotelu", "Bez kaucji"],
  },
  pt: {
    tagline: "Descubra Djerba ao seu ritmo.",
    description:
      "Explore Djerba a partir da zona turística da ilha. Fundada em 2023, a agência fica em frente ao Hotel Zenon. Capacete, cadeado antirroubo e seguro incluídos; a recolha no hotel é gratuita e não é exigida caução.",
    highlights: ["Capacete, cadeado antirroubo e seguro incluídos", "Recolha gratuita no hotel", "Sem caução"],
  },
};

const tourCopy = {
  "tour-de-lile": {
    fr: {
      name: "Tour de l'île de Djerba",
      tagline: "Une découverte de Djerba, à confirmer.",
      description:
        "Une proposition de découverte de l'île de Djerba. Des lieux connus comme Houmt Souk, Djerbahood ou Guellala peuvent être envisagés ; l'itinéraire et les détails restent à confirmer.",
      highlights: ["Découverte de l'île, itinéraire à confirmer", "Lieux possibles : Houmt Souk, Djerbahood ou Guellala", "Organisation à confirmer avec l'agence"],
    },
    en: {
      name: "Djerba Island Tour",
      tagline: "A way to discover Djerba, to be confirmed.",
      description:
        "A proposed way to discover the island of Djerba. Well-known places such as Houmt Souk, Djerbahood or Guellala may be considered; the itinerary and details are to be confirmed.",
      highlights: ["Island discovery; itinerary to be confirmed", "Possible places: Houmt Souk, Djerbahood or Guellala", "Details to be confirmed with the agency"],
    },
    de: {
      name: "Djerba-Inselrundfahrt",
      tagline: "Djerba entdecken – noch zu bestätigen.",
      description:
        "Ein Vorschlag, die Insel Djerba kennenzulernen. Bekannte Orte wie Houmt Souk, Djerbahood oder Guellala kommen möglicherweise infrage; Route und Einzelheiten müssen noch bestätigt werden.",
      highlights: ["Insel entdecken; Route noch zu bestätigen", "Mögliche Orte: Houmt Souk, Djerbahood oder Guellala", "Einzelheiten mit der Agentur abzustimmen"],
    },
    it: {
      name: "Tour dell'isola di Djerba",
      tagline: "Alla scoperta di Djerba, da confermare.",
      description:
        "Una proposta per scoprire l'isola di Djerba. Si possono valutare luoghi noti come Houmt Souk, Djerbahood o Guellala; itinerario e dettagli sono da confermare.",
      highlights: ["Alla scoperta dell'isola; itinerario da confermare", "Possibili luoghi: Houmt Souk, Djerbahood o Guellala", "Dettagli da confermare con l'agenzia"],
    },
    pl: {
      name: "Wycieczka po Dżerbie",
      tagline: "Poznaj Dżerbę — szczegóły do potwierdzenia.",
      description:
        "Propozycja poznania wyspy Dżerba. Można rozważyć znane miejsca, takie jak Houmt Souk, Djerbahood lub Guellala; trasa i szczegóły wymagają potwierdzenia.",
      highlights: ["Poznawanie wyspy; trasa do potwierdzenia", "Możliwe miejsca: Houmt Souk, Djerbahood lub Guellala", "Szczegóły do ustalenia z agencją"],
    },
    pt: {
      name: "Passeio pela ilha de Djerba",
      tagline: "Descubra Djerba — sujeito a confirmação.",
      description:
        "Uma proposta para descobrir a ilha de Djerba. Poderão ser considerados locais conhecidos como Houmt Souk, Djerbahood ou Guellala; o itinerário e os detalhes estão sujeitos a confirmação.",
      highlights: ["Descoberta da ilha; itinerário a confirmar", "Locais possíveis: Houmt Souk, Djerbahood ou Guellala", "Detalhes a confirmar com a agência"],
    },
  },
  "tour-sud-djerba": {
    fr: {
      name: "Tour du Sud de Djerba",
      tagline: "Partez à la découverte du sud de Djerba, à confirmer.",
      description:
        "Une proposition de découverte du sud de Djerba. Des lieux connus comme Guellala ou Midoun peuvent être envisagés ; l'itinéraire et les détails restent à confirmer.",
      highlights: ["Découverte du sud, itinéraire à confirmer", "Lieux possibles : Guellala ou Midoun", "Organisation à confirmer avec l'agence"],
    },
    en: {
      name: "South Djerba Tour",
      tagline: "Discover southern Djerba, subject to confirmation.",
      description:
        "A proposed way to discover southern Djerba. Well-known places such as Guellala or Midoun may be considered; the itinerary and details are to be confirmed.",
      highlights: ["Discover the south; itinerary to be confirmed", "Possible places: Guellala or Midoun", "Details to be confirmed with the agency"],
    },
    de: {
      name: "Tour durch den Süden Djerbas",
      tagline: "Den Süden Djerbas entdecken – noch zu bestätigen.",
      description:
        "Ein Vorschlag, den Süden Djerbas kennenzulernen. Bekannte Orte wie Guellala oder Midoun kommen möglicherweise infrage; Route und Einzelheiten müssen noch bestätigt werden.",
      highlights: ["Den Süden entdecken; Route noch zu bestätigen", "Mögliche Orte: Guellala oder Midoun", "Einzelheiten mit der Agentur abzustimmen"],
    },
    it: {
      name: "Tour del sud di Djerba",
      tagline: "Alla scoperta del sud di Djerba, da confermare.",
      description:
        "Una proposta per scoprire il sud di Djerba. Si possono valutare luoghi noti come Guellala o Midoun; itinerario e dettagli sono da confermare.",
      highlights: ["Alla scoperta del sud; itinerario da confermare", "Possibili luoghi: Guellala o Midoun", "Dettagli da confermare con l'agenzia"],
    },
    pl: {
      name: "Wycieczka na południe Dżerby",
      tagline: "Poznaj południe Dżerby — szczegóły do potwierdzenia.",
      description:
        "Propozycja poznania południowej części Dżerby. Można rozważyć znane miejsca, takie jak Guellala lub Midoun; trasa i szczegóły wymagają potwierdzenia.",
      highlights: ["Poznawanie południa; trasa do potwierdzenia", "Możliwe miejsca: Guellala lub Midoun", "Szczegóły do ustalenia z agencją"],
    },
    pt: {
      name: "Passeio pelo sul de Djerba",
      tagline: "Descubra o sul de Djerba — sujeito a confirmação.",
      description:
        "Uma proposta para descobrir o sul de Djerba. Poderão ser considerados locais conhecidos como Guellala ou Midoun; o itinerário e os detalhes estão sujeitos a confirmação.",
      highlights: ["Descoberta do sul; itinerário a confirmar", "Locais possíveis: Guellala ou Midoun", "Detalhes a confirmar com a agência"],
    },
  },
  "tour-nord-djerba": {
    fr: {
      name: "Tour du Nord de Djerba",
      tagline: "Découvrez le nord de Djerba, à confirmer.",
      description:
        "Une proposition de découverte du nord de Djerba. Des lieux connus comme Houmt Souk ou Sidi Mahrez peuvent être envisagés ; l'itinéraire et les détails restent à confirmer.",
      highlights: ["Découverte du nord, itinéraire à confirmer", "Lieux possibles : Houmt Souk ou Sidi Mahrez", "Organisation à confirmer avec l'agence"],
    },
    en: {
      name: "North Djerba Tour",
      tagline: "Discover northern Djerba, subject to confirmation.",
      description:
        "A proposed way to discover northern Djerba. Well-known places such as Houmt Souk or Sidi Mahrez may be considered; the itinerary and details are to be confirmed.",
      highlights: ["Discover the north; itinerary to be confirmed", "Possible places: Houmt Souk or Sidi Mahrez", "Details to be confirmed with the agency"],
    },
    de: {
      name: "Tour durch den Norden Djerbas",
      tagline: "Den Norden Djerbas entdecken – noch zu bestätigen.",
      description:
        "Ein Vorschlag, den Norden Djerbas kennenzulernen. Bekannte Orte wie Houmt Souk oder Sidi Mahrez kommen möglicherweise infrage; Route und Einzelheiten müssen noch bestätigt werden.",
      highlights: ["Den Norden entdecken; Route noch zu bestätigen", "Mögliche Orte: Houmt Souk oder Sidi Mahrez", "Einzelheiten mit der Agentur abzustimmen"],
    },
    it: {
      name: "Tour del nord di Djerba",
      tagline: "Alla scoperta del nord di Djerba, da confermare.",
      description:
        "Una proposta per scoprire il nord di Djerba. Si possono valutare luoghi noti come Houmt Souk o Sidi Mahrez; itinerario e dettagli sono da confermare.",
      highlights: ["Alla scoperta del nord; itinerario da confermare", "Possibili luoghi: Houmt Souk o Sidi Mahrez", "Dettagli da confermare con l'agenzia"],
    },
    pl: {
      name: "Wycieczka na północ Dżerby",
      tagline: "Poznaj północ Dżerby — szczegóły do potwierdzenia.",
      description:
        "Propozycja poznania północnej części Dżerby. Można rozważyć znane miejsca, takie jak Houmt Souk lub Sidi Mahrez; trasa i szczegóły wymagają potwierdzenia.",
      highlights: ["Poznawanie północy; trasa do potwierdzenia", "Możliwe miejsca: Houmt Souk lub Sidi Mahrez", "Szczegóły do ustalenia z agencją"],
    },
    pt: {
      name: "Passeio pelo norte de Djerba",
      tagline: "Descubra o norte de Djerba — sujeito a confirmação.",
      description:
        "Uma proposta para descobrir o norte de Djerba. Poderão ser considerados locais conhecidos como Houmt Souk ou Sidi Mahrez; o itinerário e os detalhes estão sujeitos a confirmação.",
      highlights: ["Descoberta do norte; itinerário a confirmar", "Locais possíveis: Houmt Souk ou Sidi Mahrez", "Detalhes a confirmar com a agência"],
    },
  },
};

const vehicleNames = {
  "formula-50cc": {
    fr: "Formula 50cc", en: "Formula 50cc", de: "Formula 50 ccm", it: "Formula 50 cc", pl: "Formula 50 cm³", pt: "Formula 50 cc",
  },
  "zimota-tapo-50cc": {
    fr: "Zimota Tapo 50cc", en: "Zimota Tapo 50cc", de: "Zimota Tapo 50 ccm", it: "Zimota Tapo 50 cc", pl: "Zimota Tapo 50 cm³", pt: "Zimota Tapo 50 cc",
  },
  "costa-first-50cc": {
    fr: "Costa First 50cc", en: "Costa First 50cc", de: "Costa First 50 ccm", it: "Costa First 50 cc", pl: "Costa First 50 cm³", pt: "Costa First 50 cc",
  },
  "elegance-50cc": {
    fr: "Elegance 50cc", en: "Elegance 50cc", de: "Elegance 50 ccm", it: "Elegance 50 cc", pl: "Elegance 50 cm³", pt: "Elegance 50 cc",
  },
  "dayun-sniper-125cc": {
    fr: "Scooter DAYUN SNIPER 125cc", en: "DAYUN SNIPER 125cc Scooter", de: "DAYUN SNIPER 125-ccm-Roller", it: "Scooter DAYUN SNIPER 125 cc", pl: "Skuter DAYUN SNIPER 125 cm³", pt: "Scooter DAYUN SNIPER 125 cc",
  },
  "zimota-sinus-125cc": {
    fr: "Zimota Sinus 125cc", en: "Zimota Sinus 125cc", de: "Zimota Sinus 125 ccm", it: "Zimota Sinus 125 cc", pl: "Zimota Sinus 125 cm³", pt: "Zimota Sinus 125 cc",
  },
  "tank-125": {
    fr: "Tank 125", en: "Tank 125", de: "Tank 125", it: "Tank 125", pl: "Tank 125", pt: "Tank 125",
  },
  "scooter-3-roues": {
    fr: "Scooter 3 roues", en: "Three-wheel scooter", de: "Dreirad-Roller", it: "Scooter a tre ruote", pl: "Skuter trójkołowy", pt: "Scooter de três rodas",
  },
  "tailg-electric-40cc": {
    fr: "Tailg Electric 40cc", en: "Tailg Electric 40cc", de: "Tailg Electric 40 ccm", it: "Tailg Electric 40 cc", pl: "Tailg Electric 40 cm³", pt: "Tailg Electric 40 cc",
  },
  "velo-electrique": {
    fr: "Vélo électrique", en: "Electric bike", de: "E-Bike", it: "Bicicletta elettrica", pl: "Rower elektryczny", pt: "Bicicleta elétrica",
  },
  "velo-normal": {
    fr: "Vélo normal", en: "Standard bicycle", de: "Fahrrad", it: "Bicicletta", pl: "Rower klasyczny", pt: "Bicicleta convencional",
  },
};

// TODO: Confirm the exact meaning and intended offer of "Location Free" with the client.
const freeRental = {
  fr: {
    name: "Location libre",
    tagline: "Une formule de location à préciser.",
    description: "Une offre de location présentée sous le nom « Location Free ». Son contenu exact reste à confirmer auprès de l'agence.",
    highlights: ["Offre et véhicule à préciser", "Détails à confirmer avec l'agence", "Tarif test affiché en EUR par jour"],
  },
  en: {
    name: "Location Free",
    tagline: "A rental option to be clarified.",
    description: "A rental offer listed as “Location Free”. Its exact meaning and contents are to be confirmed with the agency.",
    highlights: ["Offer and vehicle to be clarified", "Details to be confirmed with the agency", "Test price shown in EUR per day"],
  },
  de: {
    name: "Location Free",
    tagline: "Ein Mietangebot, dessen Details noch zu klären sind.",
    description: "Ein als „Location Free“ aufgeführtes Mietangebot. Die genaue Bedeutung und der Leistungsumfang müssen noch mit der Agentur geklärt werden.",
    highlights: ["Angebot und Fahrzeug noch zu klären", "Einzelheiten mit der Agentur abzustimmen", "Testpreis in EUR pro Tag"],
  },
  it: {
    name: "Location Free",
    tagline: "Una formula di noleggio da chiarire.",
    description: "Un'offerta di noleggio indicata come «Location Free». Il significato esatto e i dettagli sono da confermare con l'agenzia.",
    highlights: ["Offerta e veicolo da precisare", "Dettagli da confermare con l'agenzia", "Prezzo di test indicato in EUR al giorno"],
  },
  pl: {
    name: "Location Free",
    tagline: "Oferta wynajmu wymagająca doprecyzowania.",
    description: "Oferta wynajmu widniejąca pod nazwą „Location Free”. Jej dokładne znaczenie i zakres należy potwierdzić z agencją.",
    highlights: ["Oferta i pojazd do ustalenia", "Szczegóły do potwierdzenia z agencją", "Cena testowa podana w EUR za dzień"],
  },
  pt: {
    name: "Location Free",
    tagline: "Uma opção de aluguer a esclarecer.",
    description: "Uma oferta de aluguer apresentada como «Location Free». O seu significado exato e o que inclui estão sujeitos a confirmação com a agência.",
    highlights: ["Oferta e veículo por esclarecer", "Detalhes a confirmar com a agência", "Preço de teste indicado em EUR por dia"],
  },
};

function makeTranslations(id) {
  const tour = tourCopy[id];
  if (tour) return tour;
  if (id === "location-free") return freeRental;

  return Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      {
        name: vehicleNames[id][locale],
        ...vehicleCopy[locale],
      },
    ]),
  );
}

function makePriceTiers(amount) {
  return [1, 3, 7, 14].map((minDays, index) => ({
    minDays,
    pricePerDay: Math.round(amount * (1 - index * 0.05) * 100) / 100,
  }));
}

const displayOrder = {
  "formula-50cc": 1,
  "zimota-tapo-50cc": 2,
  "costa-first-50cc": 3,
  "elegance-50cc": 4,
  "dayun-sniper-125cc": 5,
  "zimota-sinus-125cc": 6,
  "tank-125": 7,
  "scooter-3-roues": 8,
  "tailg-electric-40cc": 9,
  "velo-electrique": 10,
  "velo-normal": 11,
  "tour-de-lile": 12,
  "tour-sud-djerba": 13,
  "tour-nord-djerba": 14,
  "location-free": 15,
};

const tourDetails = {
  "tour-de-lile": { duration: 300, capacityPerSlot: 8 },
  "tour-sud-djerba": { duration: 240, capacityPerSlot: 6 },
  "tour-nord-djerba": { duration: 240, capacityPerSlot: 6 },
};

function enrichProduct(product) {
  const type =
    product.category === "tour"
      ? "tour"
      : product.rentalType === "free"
        ? "free_rental"
        : "vehicle";
  const enrichment = {
    type,
    order: displayOrder[product.id],
    currency: "EUR",
    images: [],
    translations: makeTranslations(product.id),
  };

  if (type === "vehicle") {
    enrichment.priceTiers = makePriceTiers(product.price.amount);
    enrichment.specs = {
      engine: product.engine,
      fuel: product.fuel,
      transmission: product.transmission,
      passengers:
        product.category === "bicycle" || product.category === "electric_bike"
          ? 1
          : 2,
    };
  } else if (type === "tour") {
    Object.assign(enrichment, tourDetails[product.id]);
  }

  return { ...product, ...enrichment };
}

module.exports = { enrichProduct, LOCALES };
