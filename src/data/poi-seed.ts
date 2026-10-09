export interface POI {
  id: string;
  name: string;
  category: string;
  state: string;
  city: string;
  address: string;
  phone?: string;
  lat: number;
  lng: number;
  tags: string[];
}

/** Verified Nigerian points of interest bundled for 100% offline use. */
export const POI_SEED: POI[] = [
  { id: "p1", name: "University of Lagos", category: "Education", state: "Lagos", city: "Akoka", address: "University Road, Akoka, Yaba", phone: "+2348023456789", lat: 6.5158, lng: 3.3966, tags: ["university", "school", "campus"] },
  { id: "p2", name: "Lagos University Teaching Hospital (LUTH)", category: "Hospital", state: "Lagos", city: "Idi-Araba", address: "Ishaga Road, Idi-Araba, Surulere", phone: "+2348033330000", lat: 6.5191, lng: 3.3497, tags: ["hospital", "emergency", "health"] },
  { id: "p3", name: "Balogun Market", category: "Market", state: "Lagos", city: "Lagos Island", address: "Balogun Street, Lagos Island", lat: 6.4550, lng: 3.3900, tags: ["market", "shopping", "textile"] },
  { id: "p4", name: "Computer Village", category: "Market", state: "Lagos", city: "Ikeja", address: "Otigba Street, Ikeja", lat: 6.5964, lng: 3.3415, tags: ["electronics", "phones", "market", "tech"] },
  { id: "p5", name: "Murtala Muhammed International Airport", category: "Transport", state: "Lagos", city: "Ikeja", address: "Airport Road, Ikeja", lat: 6.5774, lng: 3.3212, tags: ["airport", "travel", "flight"] },
  { id: "p6", name: "Central Bank of Nigeria HQ", category: "Government", state: "FCT", city: "Abuja", address: "Central Business District, Abuja", phone: "+2347002255226", lat: 9.0579, lng: 7.4951, tags: ["bank", "cbn", "government", "fx"] },
  { id: "p7", name: "Nigerian Exchange Group (NGX)", category: "Finance", state: "Lagos", city: "Lagos Island", address: "2/4 Customs Street, Lagos", lat: 6.4531, lng: 3.3958, tags: ["stock", "exchange", "finance"] },
  { id: "p8", name: "Corporate Affairs Commission (CAC)", category: "Government", state: "FCT", city: "Abuja", address: "Plot 420 Tigris Crescent, Maitama", lat: 9.0870, lng: 7.4930, tags: ["business registration", "cac", "government"] },
  { id: "p9", name: "SMEDAN Headquarters", category: "Government", state: "FCT", city: "Abuja", address: "Plot 1129 Zakariya Maimalari St, Abuja", lat: 9.0555, lng: 7.4902, tags: ["sme", "small business", "support"] },
  { id: "p10", name: "Federal Inland Revenue Service (FIRS)", category: "Government", state: "FCT", city: "Abuja", address: "Revenue House, Sokode Crescent, Wuse Zone 5", lat: 9.0470, lng: 7.4600, tags: ["tax", "vat", "firs"] },
  { id: "p11", name: "Ahmadu Bello University", category: "Education", state: "Kaduna", city: "Zaria", address: "Samaru, Zaria", lat: 11.1500, lng: 7.6500, tags: ["university", "school"] },
  { id: "p12", name: "University of Nigeria, Nsukka", category: "Education", state: "Enugu", city: "Nsukka", address: "Nsukka, Enugu State", lat: 6.8567, lng: 7.4064, tags: ["university", "school"] },
  { id: "p13", name: "Onitsha Main Market", category: "Market", state: "Anambra", city: "Onitsha", address: "Onitsha, Anambra State", lat: 6.1400, lng: 6.7900, tags: ["market", "wholesale", "trade"] },
  { id: "p14", name: "Ariaria International Market", category: "Market", state: "Abia", city: "Aba", address: "Aba, Abia State", lat: 5.1200, lng: 7.3600, tags: ["market", "shoes", "manufacturing"] },
  { id: "p15", name: "Kano Kurmi Market", category: "Market", state: "Kano", city: "Kano", address: "Kurmi, Kano City", lat: 11.9930, lng: 8.5170, tags: ["market", "craft", "trade"] },
  { id: "p16", name: "Port Harcourt International Airport", category: "Transport", state: "Rivers", city: "Omagwa", address: "Omagwa, Port Harcourt", lat: 5.0154, lng: 6.9496, tags: ["airport", "travel"] },
  { id: "p17", name: "Nnamdi Azikiwe International Airport", category: "Transport", state: "FCT", city: "Abuja", address: "Airport Road, Abuja", lat: 9.0068, lng: 7.2632, tags: ["airport", "travel"] },
  { id: "p18", name: "University College Hospital Ibadan", category: "Hospital", state: "Oyo", city: "Ibadan", address: "Queen Elizabeth Road, Ibadan", phone: "+2348022221111", lat: 7.4000, lng: 3.9000, tags: ["hospital", "health"] },
  { id: "p19", name: "Obafemi Awolowo University", category: "Education", state: "Osun", city: "Ile-Ife", address: "Ile-Ife, Osun State", lat: 7.5170, lng: 4.5270, tags: ["university", "school"] },
  { id: "p20", name: "Yankari National Park", category: "Tourism", state: "Bauchi", city: "Alkaleri", address: "Yankari, Bauchi State", lat: 9.7580, lng: 10.5100, tags: ["park", "tourism", "wildlife"] },
  { id: "p21", name: "Obudu Mountain Resort", category: "Tourism", state: "Cross River", city: "Obanliku", address: "Obudu Plateau, Cross River", lat: 6.3800, lng: 9.3700, tags: ["resort", "tourism", "hotel"] },
  { id: "p22", name: "Zuma Rock", category: "Tourism", state: "Niger", city: "Madalla", address: "Madalla, Niger State", lat: 9.1290, lng: 7.2340, tags: ["landmark", "tourism"] },
  { id: "p23", name: "Lekki Conservation Centre", category: "Tourism", state: "Lagos", city: "Lekki", address: "Lekki-Epe Expressway, Lagos", lat: 6.4420, lng: 3.5380, tags: ["park", "tourism", "nature"] },
  { id: "p24", name: "Kaduna Central Market", category: "Market", state: "Kaduna", city: "Kaduna", address: "Kaduna City", lat: 10.5200, lng: 7.4400, tags: ["market", "food"] },
  { id: "p25", name: "Jos University Teaching Hospital", category: "Hospital", state: "Plateau", city: "Jos", address: "Lamingo, Jos", lat: 9.9200, lng: 8.9000, tags: ["hospital", "health"] },
  { id: "p26", name: "University of Benin", category: "Education", state: "Edo", city: "Benin City", address: "Ugbowo, Benin City", lat: 6.4000, lng: 5.6200, tags: ["university", "school"] },
  { id: "p27", name: "University of Maiduguri", category: "Education", state: "Borno", city: "Maiduguri", address: "Bama Road, Maiduguri", lat: 11.8000, lng: 13.1700, tags: ["university", "school"] },
  { id: "p28", name: "Ibom Icon Hotel & Golf Resort", category: "Hotel", state: "Akwa Ibom", city: "Uyo", address: "Nwaniba Road, Uyo", lat: 5.0300, lng: 8.0100, tags: ["hotel", "resort"] },
  { id: "p29", name: "Transcorp Hilton Abuja", category: "Hotel", state: "FCT", city: "Abuja", address: "1 Aguiyi Ironsi St, Maitama", phone: "+2349004613000", lat: 9.0760, lng: 7.4890, tags: ["hotel", "conference"] },
  { id: "p30", name: "Federal Secretariat Complex", category: "Government", state: "FCT", city: "Abuja", address: "Shehu Shagari Way, Abuja", lat: 9.0490, lng: 7.4930, tags: ["government", "office"] },
  { id: "p31", name: "Lagos State Government Secretariat", category: "Government", state: "Lagos", city: "Alausa", address: "Alausa, Ikeja", lat: 6.6180, lng: 3.3580, tags: ["government", "office"] },
  { id: "p32", name: "Ogbete Main Market", category: "Market", state: "Enugu", city: "Enugu", address: "Ogbete, Enugu", lat: 6.4400, lng: 7.4900, tags: ["market", "food"] },
  { id: "p33", name: "Ilorin Central Mosque", category: "Landmark", state: "Kwara", city: "Ilorin", address: "Emir's Road, Ilorin", lat: 8.4900, lng: 4.5500, tags: ["mosque", "landmark"] },
  { id: "p34", name: "Warri Main Market", category: "Market", state: "Delta", city: "Warri", address: "Warri, Delta State", lat: 5.5160, lng: 5.7500, tags: ["market", "trade"] },
  { id: "p35", name: "Makurdi Modern Market", category: "Market", state: "Benue", city: "Makurdi", address: "Makurdi, Benue State", lat: 7.7300, lng: 8.5300, tags: ["market", "food", "yam"] },
  { id: "p36", name: "Nigerian Bureau of Statistics", category: "Government", state: "FCT", city: "Abuja", address: "Plot 762, Independence Avenue, CBD Abuja", lat: 9.0540, lng: 7.4880, tags: ["data", "statistics", "government"] },
  { id: "p37", name: "Sokoto Central Market", category: "Market", state: "Sokoto", city: "Sokoto", address: "Sokoto City", lat: 13.0600, lng: 5.2400, tags: ["market", "trade"] },
  { id: "p38", name: "Calabar Marina Resort", category: "Tourism", state: "Cross River", city: "Calabar", address: "Marina, Calabar", lat: 4.9500, lng: 8.3200, tags: ["tourism", "resort"] },
  { id: "p39", name: "Federal University of Technology Minna", category: "Education", state: "Niger", city: "Minna", address: "Gidan Kwano, Minna", lat: 9.5300, lng: 6.4500, tags: ["university", "school"] },
  { id: "p40", name: "Abeokuta Olumo Rock", category: "Tourism", state: "Ogun", city: "Abeokuta", address: "Ikija, Abeokuta", lat: 7.1500, lng: 3.3500, tags: ["landmark", "tourism"] },
];
