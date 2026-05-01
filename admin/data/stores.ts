export interface Shop {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  type: "Pharmacy" | "Ayurvedic Store" | "Health Center" | "Supermarket";
}

export interface Town {
  name: string;
  shops: Shop[];
}

export interface District {
  name: string;
  towns: Town[];
}

export interface Province {
  name: string;
  icon: string;
  districts: District[];
}

export const provinces: Province[] = [
  {
    name: "Western Province",
    icon: "🌆",
    districts: [
      {
        name: "Colombo",
        towns: [
          {
            name: "Colombo 7",
            shops: [
              {
                id: 101,
                name: "Rajapura Herbal Centre – Colombo 7",
                address: "No. 45, Bauddhaloka Mawatha, Colombo 07",
                phone: "011 2 567 890",
                hours: "Mon–Sat: 8:00 AM – 8:00 PM",
                type: "Ayurvedic Store",
              },
            ],
          },
          {
            name: "Borella",
            shops: [
              {
                id: 102,
                name: "Osu Sala – Borella",
                address: "No. 12, Kynsey Road, Borella, Colombo 08",
                phone: "011 2 695 412",
                hours: "Mon–Sun: 7:00 AM – 9:00 PM",
                type: "Pharmacy",
              },
            ],
          },
          {
            name: "Nugegoda",
            shops: [
              {
                id: 103,
                name: "Keells Super – Nugegoda",
                address: "No. 78, High Level Road, Nugegoda",
                phone: "011 2 854 201",
                hours: "Mon–Sun: 8:00 AM – 10:00 PM",
                type: "Supermarket",
              },
            ],
          },
        ],
      },
      {
        name: "Gampaha",
        towns: [
          {
            name: "Gampaha Town",
            shops: [
              {
                id: 104,
                name: "Rajapura Wellness Store – Gampaha",
                address: "No. 23, Hospital Road, Gampaha",
                phone: "033 2 222 548",
                hours: "Mon–Sat: 8:30 AM – 7:00 PM",
                type: "Ayurvedic Store",
              },
            ],
          },
          {
            name: "Negombo",
            shops: [
              {
                id: 105,
                name: "Nature's Health – Negombo",
                address: "No. 56, Main Street, Negombo",
                phone: "031 2 238 410",
                hours: "Mon–Sun: 9:00 AM – 8:00 PM",
                type: "Health Center",
              },
            ],
          },
        ],
      },
      {
        name: "Kalutara",
        towns: [
          {
            name: "Kalutara Town",
            shops: [
              {
                id: 106,
                name: "Herbal Plus – Kalutara Town",
                address: "No. 14, Galle Road, Kalutara",
                phone: "034 2 225 601",
                hours: "Mon–Sat: 8:00 AM – 7:30 PM",
                type: "Pharmacy",
              },
            ],
          },
          {
            name: "Panadura",
            shops: [
              {
                id: 107,
                name: "Rajapura Authorized Dealer – Panadura",
                address: "No. 91, Station Road, Panadura",
                phone: "038 2 233 715",
                hours: "Mon–Fri: 9:00 AM – 6:00 PM",
                type: "Ayurvedic Store",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Central Province",
    icon: "🏔️",
    districts: [
      {
        name: "Kandy",
        towns: [
          {
            name: "Kandy City",
            shops: [
              {
                id: 201,
                name: "Rajapura Flagship – Kandy City",
                address: "No. 7, Dalada Veediya, Kandy",
                phone: "081 2 224 500",
                hours: "Mon–Sun: 8:00 AM – 9:00 PM",
                type: "Ayurvedic Store",
              },
              {
                id: 202,
                name: "Suwa Osu Pola – Kandy",
                address: "No. 33, Peradeniya Road, Kandy",
                phone: "081 2 237 812",
                hours: "Mon–Sat: 7:30 AM – 8:00 PM",
                type: "Pharmacy",
              },
            ],
          },
          {
            name: "Katugastota",
            shops: [
              {
                id: 203,
                name: "Lanka Sathosa – Katugastota",
                address: "Katugastota Junction, Kandy",
                phone: "081 2 498 006",
                hours: "Mon–Sun: 8:00 AM – 9:00 PM",
                type: "Supermarket",
              },
            ],
          },
        ],
      },
      {
        name: "Matale",
        towns: [
          {
            name: "Matale Town",
            shops: [
              {
                id: 204,
                name: "Ayur Herbal – Matale",
                address: "No. 19, King's Street, Matale",
                phone: "066 2 222 318",
                hours: "Mon–Sat: 8:00 AM – 7:00 PM",
                type: "Health Center",
              },
            ],
          },
          {
            name: "Dambulla",
            shops: [
              {
                id: 205,
                name: "Rajapura Outlet – Dambulla",
                address: "No. 45, Anuradhapura Road, Dambulla",
                phone: "066 2 284 709",
                hours: "Mon–Sun: 9:00 AM – 8:00 PM",
                type: "Ayurvedic Store",
              },
            ],
          },
        ],
      },
      {
        name: "Nuwara Eliya",
        towns: [
          {
            name: "Nuwara Eliya Town",
            shops: [
              {
                id: 206,
                name: "Highland Herbal – Nuwara Eliya",
                address: "No. 8, New Bazaar Street, Nuwara Eliya",
                phone: "052 2 222 156",
                hours: "Mon–Sat: 8:30 AM – 6:30 PM",
                type: "Pharmacy",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Southern Province",
    icon: "🌊",
    districts: [
      {
        name: "Galle",
        towns: [
          {
            name: "Galle Fort",
            shops: [
              {
                id: 301,
                name: "Rajapura Herbal – Galle Fort",
                address: "No. 22, Church Street, Galle Fort",
                phone: "091 2 234 820",
                hours: "Mon–Sun: 9:00 AM – 8:00 PM",
                type: "Ayurvedic Store",
              },
            ],
          },
          {
            name: "Hikkaduwa",
            shops: [
              {
                id: 302,
                name: "Osu Sala – Hikkaduwa",
                address: "Hikkaduwa Main Road, Hikkaduwa",
                phone: "091 2 277 543",
                hours: "Mon–Sat: 8:00 AM – 7:00 PM",
                type: "Pharmacy",
              },
            ],
          },
        ],
      },
      {
        name: "Matara",
        towns: [
          {
            name: "Matara Town",
            shops: [
              {
                id: 303,
                name: "Nature Care – Matara",
                address: "No. 5, Anagarika Dharmapala Mw, Matara",
                phone: "041 2 222 415",
                hours: "Mon–Sat: 8:00 AM – 7:30 PM",
                type: "Health Center",
              },
            ],
          },
          {
            name: "Weligama",
            shops: [
              {
                id: 304,
                name: "Rajapura Store – Weligama",
                address: "No. 17, Bay Road, Weligama",
                phone: "041 2 250 802",
                hours: "Mon–Sun: 9:00 AM – 7:00 PM",
                type: "Ayurvedic Store",
              },
            ],
          },
        ],
      },
      {
        name: "Hambantota",
        towns: [
          {
            name: "Hambantota Town",
            shops: [
              {
                id: 305,
                name: "Seethawaka Herbal – Hambantota",
                address: "No. 11, Tissa Road, Hambantota",
                phone: "047 2 220 634",
                hours: "Mon–Sat: 8:30 AM – 6:30 PM",
                type: "Pharmacy",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Northern Province",
    icon: "🏛️",
    districts: [
      {
        name: "Jaffna",
        towns: [
          {
            name: "Jaffna Town",
            shops: [
              {
                id: 401,
                name: "Rajapura Herbal – Jaffna",
                address: "No. 34, Hospital Road, Jaffna",
                phone: "021 2 222 617",
                hours: "Mon–Sat: 8:00 AM – 7:00 PM",
                type: "Ayurvedic Store",
              },
              {
                id: 402,
                name: "Siddha Medical Hall – Jaffna",
                address: "No. 67, Stanley Road, Jaffna",
                phone: "021 2 224 388",
                hours: "Mon–Sun: 8:00 AM – 8:00 PM",
                type: "Health Center",
              },
            ],
          },
        ],
      },
      {
        name: "Vavuniya",
        towns: [
          {
            name: "Vavuniya Town",
            shops: [
              {
                id: 403,
                name: "Wellness Outlet – Vavuniya",
                address: "No. 9, 2nd Cross Street, Vavuniya",
                phone: "024 2 222 801",
                hours: "Mon–Sat: 9:00 AM – 6:00 PM",
                type: "Pharmacy",
              },
            ],
          },
        ],
      },
      {
        name: "Mannar",
        towns: [
          {
            name: "Mannar Town",
            shops: [
              {
                id: 404,
                name: "Rajapura Authorized – Mannar",
                address: "No. 3, Main Street, Mannar",
                phone: "023 2 225 104",
                hours: "Mon–Fri: 8:30 AM – 5:30 PM",
                type: "Ayurvedic Store",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Eastern Province",
    icon: "🌅",
    districts: [
      {
        name: "Trincomalee",
        towns: [
          {
            name: "Trincomalee Town",
            shops: [
              {
                id: 501,
                name: "Rajapura Herbal – Trincomalee",
                address: "No. 21, Main Street, Trincomalee",
                phone: "026 2 222 501",
                hours: "Mon–Sat: 8:30 AM – 7:00 PM",
                type: "Ayurvedic Store",
              },
            ],
          },
        ],
      },
      {
        name: "Batticaloa",
        towns: [
          {
            name: "Batticaloa Town",
            shops: [
              {
                id: 502,
                name: "Eastern Wellness – Batticaloa",
                address: "No. 8, Lloyd's Avenue, Batticaloa",
                phone: "065 2 222 740",
                hours: "Mon–Sat: 9:00 AM – 6:30 PM",
                type: "Health Center",
              },
              {
                id: 503,
                name: "Osu Sala – Batticaloa",
                address: "No. 15, Bar Road, Batticaloa",
                phone: "065 2 225 819",
                hours: "Mon–Sun: 8:00 AM – 8:00 PM",
                type: "Pharmacy",
              },
            ],
          },
        ],
      },
      {
        name: "Ampara",
        towns: [
          {
            name: "Ampara Town",
            shops: [
              {
                id: 504,
                name: "Rajapura Store – Ampara",
                address: "No. 6, DS Senanayake Street, Ampara",
                phone: "063 2 222 933",
                hours: "Mon–Sat: 8:00 AM – 6:00 PM",
                type: "Ayurvedic Store",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "North Western Province",
    icon: "🌿",
    districts: [
      {
        name: "Kurunegala",
        towns: [
          {
            name: "Kurunegala Town",
            shops: [
              {
                id: 601,
                name: "Rajapura Herbal Hub – Kurunegala",
                address: "No. 38, Colombo Road, Kurunegala",
                phone: "037 2 222 619",
                hours: "Mon–Sat: 8:00 AM – 8:00 PM",
                type: "Ayurvedic Store",
              },
            ],
          },
          {
            name: "Kuliyapitiya",
            shops: [
              {
                id: 602,
                name: "Lanka Osu Sala – Kuliyapitiya",
                address: "No. 22, Main Street, Kuliyapitiya",
                phone: "037 2 281 455",
                hours: "Mon–Sun: 7:30 AM – 8:30 PM",
                type: "Pharmacy",
              },
            ],
          },
          {
            name: "Wariyapola",
            shops: [
              {
                id: 603,
                name: "Herbal Life – Wariyapola",
                address: "No. 5, Wennappuwa Road, Wariyapola",
                phone: "037 2 267 118",
                hours: "Mon–Fri: 8:30 AM – 6:00 PM",
                type: "Health Center",
              },
            ],
          },
        ],
      },
      {
        name: "Puttalam",
        towns: [
          {
            name: "Puttalam Town",
            shops: [
              {
                id: 604,
                name: "Rajapura Outlet – Puttalam",
                address: "No. 11, Chilaw Road, Puttalam",
                phone: "032 2 265 334",
                hours: "Mon–Sat: 8:00 AM – 7:00 PM",
                type: "Ayurvedic Store",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "North Central Province",
    icon: "🏺",
    districts: [
      {
        name: "Anuradhapura",
        towns: [
          {
            name: "Anuradhapura Town",
            shops: [
              {
                id: 701,
                name: "Sacred City Herbal – Anuradhapura",
                address: "No. 17, Maithripala Road, Anuradhapura",
                phone: "025 2 222 711",
                hours: "Mon–Sat: 8:00 AM – 7:30 PM",
                type: "Ayurvedic Store",
              },
            ],
          },
          {
            name: "New Town",
            shops: [
              {
                id: 702,
                name: "Rajapura Wellness – New Town",
                address: "No. 44, New Town, Anuradhapura",
                phone: "025 2 238 506",
                hours: "Mon–Sun: 8:30 AM – 8:00 PM",
                type: "Health Center",
              },
            ],
          },
        ],
      },
      {
        name: "Polonnaruwa",
        towns: [
          {
            name: "Polonnaruwa Town",
            shops: [
              {
                id: 703,
                name: "Ancient Remedies – Polonnaruwa",
                address: "No. 9, Habarana Road, Polonnaruwa",
                phone: "027 2 222 345",
                hours: "Mon–Sat: 8:30 AM – 6:30 PM",
                type: "Pharmacy",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Uva Province",
    icon: "☕",
    districts: [
      {
        name: "Badulla",
        towns: [
          {
            name: "Badulla Town",
            shops: [
              {
                id: 801,
                name: "Rajapura Herbal – Badulla",
                address: "No. 25, Bank Road, Badulla",
                phone: "055 2 222 418",
                hours: "Mon–Sat: 8:00 AM – 7:00 PM",
                type: "Ayurvedic Store",
              },
            ],
          },
          {
            name: "Ella",
            shops: [
              {
                id: 802,
                name: "Ella Health Store",
                address: "Passara Road, Ella",
                phone: "057 2 228 904",
                hours: "Mon–Sun: 9:00 AM – 7:00 PM",
                type: "Health Center",
              },
            ],
          },
        ],
      },
      {
        name: "Monaragala",
        towns: [
          {
            name: "Monaragala Town",
            shops: [
              {
                id: 803,
                name: "Rajapura Outlet – Monaragala",
                address: "No. 7, Wellawaya Road, Monaragala",
                phone: "055 2 276 205",
                hours: "Mon–Sat: 8:30 AM – 6:00 PM",
                type: "Ayurvedic Store",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Sabaragamuwa Province",
    icon: "💎",
    districts: [
      {
        name: "Ratnapura",
        towns: [
          {
            name: "Ratnapura Town",
            shops: [
              {
                id: 901,
                name: "Gem City Herbal – Ratnapura",
                address: "No. 33, Main Street, Ratnapura",
                phone: "045 2 222 516",
                hours: "Mon–Sat: 8:00 AM – 8:00 PM",
                type: "Ayurvedic Store",
              },
              {
                id: 902,
                name: "Rajapura Wellness – Ratnapura",
                address: "No. 15, Colombo Road, Ratnapura",
                phone: "045 2 231 788",
                hours: "Mon–Sun: 8:30 AM – 7:30 PM",
                type: "Health Center",
              },
            ],
          },
        ],
      },
      {
        name: "Kegalle",
        towns: [
          {
            name: "Kegalle Town",
            shops: [
              {
                id: 903,
                name: "Rajapura Herbal – Kegalle",
                address: "No. 8, Kandy Road, Kegalle",
                phone: "035 2 222 694",
                hours: "Mon–Sat: 8:00 AM – 7:00 PM",
                type: "Ayurvedic Store",
              },
            ],
          },
          {
            name: "Mawanella",
            shops: [
              {
                id: 904,
                name: "Mawanella Osu Sala",
                address: "No. 21, Main Street, Mawanella",
                phone: "035 2 246 317",
                hours: "Mon–Sun: 7:30 AM – 9:00 PM",
                type: "Pharmacy",
              },
            ],
          },
        ],
      },
    ],
  },
];