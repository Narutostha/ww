export const CURRENCY = {
  symbol: 'NPR',
  code: 'NPR',
  name: 'Nepalese Rupee',
  format: (amount: number) => `NPR`
};

export const SHIPPING = {
  freeShippingThreshold: 10000, // NPR
  baseShippingCost: {
    kathmanduValley: 200,
    outsideValley: 300
  },
  deliveryTimes: {
    kathmanduValley: '2-3 days',
    outsideValley: '3-7 days'
  }
};

export const CONTACT = {
  phone: '+977-1-4XXXXXX',
  email: 'bluawayclo@gmail.com',
  address: 'Thamel, Kathmandu',
  hours: {
    weekdays: '10:00 AM - 6:00 PM',
    saturday: '11:00 AM - 4:00 PM',
    sunday: 'Closed'
  }
};

export const SOCIAL_MEDIA = {
  facebook: 'https://www.facebook.com/people/Bluaway/61571966904270/',
  instagram: 'https://www.instagram.com/bluawayofficial/',
  tiktok: 'https://www.tiktok.com/@bluawayofficial'

};

export const REGIONS = {
  provinces: [
    'Province 1',
    'Madhesh',
    'Bagmati',
    'Gandaki',
    'Lumbini',
    'Karnali',
    'Sudurpashchim'
  ],
  cities: {
    'Bagmati': [
      'Kathmandu',
      'Lalitpur',
      'Bhaktapur',
      'Chitwan',
      'Makwanpur',
      'Kavrepalanchok',
      'Sindhupalchok'
    ],
    'Gandaki': [
      'Pokhara',
      'Gorkha',
      'Lamjung',
      'Syangja',
      'Tanahun',
      'Kaski',
      'Baglung'
    ]
  }
};