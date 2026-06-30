export interface StateUT {
  name: string;
  type: 'State' | 'Union Territory';
  capital: string;
  wards: string[];
}

export const STATES_AND_UTS: StateUT[] = [
  // 28 States
  {
    name: 'Andhra Pradesh',
    type: 'State',
    capital: 'Amaravati',
    wards: ['Ward 01 (Vijayawada)', 'Ward 02 (Visakhapatnam)', 'Ward 03 (Guntur)', 'Ward 04 (Tirupati)']
  },
  {
    name: 'Arunachal Pradesh',
    type: 'State',
    capital: 'Itanagar',
    wards: ['Ward 01 (Itanagar Sector A)', 'Ward 02 (Naharlagun)', 'Ward 03 (Pasighat)']
  },
  {
    name: 'Assam',
    type: 'State',
    capital: 'Dispur',
    wards: ['Ward 01 (Dispur Capital Complex)', 'Ward 02 (Guwahati Paltan Bazaar)', 'Ward 03 (Dibrugarh)', 'Ward 04 (Silchar)']
  },
  {
    name: 'Bihar',
    type: 'State',
    capital: 'Patna',
    wards: ['Ward 01 (Patna Sahib)', 'Ward 02 (Kankarbagh)', 'Ward 03 (Muzaffarpur)', 'Ward 04 (Gaya Central)']
  },
  {
    name: 'Chhattisgarh',
    type: 'State',
    capital: 'Raipur',
    wards: ['Ward 01 (Raipur Civil Lines)', 'Ward 02 (Bhilai Sector 1)', 'Ward 03 (Bilaspur Zone A)']
  },
  {
    name: 'Goa',
    type: 'State',
    capital: 'Panaji',
    wards: ['Ward 01 (Panaji Altinho)', 'Ward 02 (Margao City)', 'Ward 03 (Vasco da Gama)']
  },
  {
    name: 'Gujarat',
    type: 'State',
    capital: 'Gandhinagar',
    wards: [
      'Ward 09 (Amin Marg / Kalavad Rd, Rajkot, Gujarat)',
      'Ward 02 (Navrangpura, Ahmedabad, Gujarat)',
      'Ward 06 (Adajan / Pal, Surat, Gujarat)',
      'Ward 11 (Alkapuri, Vadodara, Gujarat)',
      'Ward 01 (Sector 21, Gandhinagar, Gujarat)'
    ]
  },
  {
    name: 'Haryana',
    type: 'State',
    capital: 'Chandigarh',
    wards: ['Ward 01 (Gurugram Sector 45)', 'Ward 02 (Faridabad)', 'Ward 03 (Panchkula Sector 15)', 'Ward 04 (Ambala)']
  },
  {
    name: 'Himachal Pradesh',
    type: 'State',
    capital: 'Shimla',
    wards: ['Ward 01 (Shimla Mall Road)', 'Ward 02 (Dharamshala Kotwali Bazaar)', 'Ward 03 (Solan Central)', 'Ward 04 (Manali)']
  },
  {
    name: 'Jharkhand',
    type: 'State',
    capital: 'Ranchi',
    wards: ['Ward 01 (Ranchi Lalpur)', 'Ward 02 (Jamshedpur Bistupur)', 'Ward 03 (Dhanbad Center)', 'Ward 04 (Bokaro)']
  },
  {
    name: 'Karnataka',
    type: 'State',
    capital: 'Bengaluru',
    wards: ['Ward 05 (Indiranagar, Bengaluru)', 'Ward 12 (Koramangala, Bengaluru)', 'Ward 08 (Jayanagar, Bengaluru)', 'Ward 03 (Mysuru Center)']
  },
  {
    name: 'Kerala',
    type: 'State',
    capital: 'Thiruvananthapuram',
    wards: ['Ward 01 (Trivandrum Fort)', 'Ward 02 (Kochi Fort)', 'Ward 03 (Kozhikode)', 'Ward 04 (Thrissur)']
  },
  {
    name: 'Madhya Pradesh',
    type: 'State',
    capital: 'Bhopal',
    wards: ['Ward 01 (Bhopal MP Nagar)', 'Ward 02 (Indore Vijay Nagar)', 'Ward 03 (Gwalior Lashkar)', 'Ward 04 (Jabalpur Cantt)']
  },
  {
    name: 'Maharashtra',
    type: 'State',
    capital: 'Mumbai',
    wards: ['Ward 12 (Bandra West, Mumbai)', 'Ward 05 (Andheri East, Mumbai)', 'Ward 01 (Nariman Point, Mumbai)', 'Ward 08 (Deccan, Pune)', 'Ward 03 (Nagpur Civil Lines)']
  },
  {
    name: 'Manipur',
    type: 'State',
    capital: 'Imphal',
    wards: ['Ward 01 (Imphal Kangla)', 'Ward 02 (Thoubal)', 'Ward 03 (Churachandpur)']
  },
  {
    name: 'Meghalaya',
    type: 'State',
    capital: 'Shillong',
    wards: ['Ward 01 (Shillong Police Bazar)', 'Ward 02 (Tura Main)', 'Ward 03 (Cherrapunji Point)']
  },
  {
    name: 'Mizoram',
    type: 'State',
    capital: 'Aizawl',
    wards: ['Ward 01 (Aizawl Tuikual)', 'Ward 02 (Lunglei Center)', 'Ward 03 (Saiha)']
  },
  {
    name: 'Nagaland',
    type: 'State',
    capital: 'Kohima',
    wards: ['Ward 01 (Kohima Midland)', 'Ward 02 (Dimapur Town)', 'Ward 03 (Mokokchung)']
  },
  {
    name: 'Odisha',
    type: 'State',
    capital: 'Bhubaneswar',
    wards: ['Ward 01 (Bhubaneswar Saheed Nagar)', 'Ward 02 (Cuttack Link Road)', 'Ward 03 (Rourkela Sector 5)', 'Ward 04 (Puri Grand Road)']
  },
  {
    name: 'Punjab',
    type: 'State',
    capital: 'Chandigarh',
    wards: ['Ward 01 (Amritsar Golden Temple)', 'Ward 02 (Ludhiana Model Town)', 'Ward 03 (Jalandhar Cantt)', 'Ward 04 (Patiala Central)']
  },
  {
    name: 'Rajasthan',
    type: 'State',
    capital: 'Jaipur',
    wards: ['Ward 01 (Jaipur C-Scheme)', 'Ward 02 (Jodhpur Sardarpura)', 'Ward 03 (Udaipur Lake Area)', 'Ward 04 (Kota Talwandi)']
  },
  {
    name: 'Sikkim',
    type: 'State',
    capital: 'Gangtok',
    wards: ['Ward 01 (Gangtok MG Marg)', 'Ward 02 (Namchi)', 'Ward 03 (Gyalshing)']
  },
  {
    name: 'Tamil Nadu',
    type: 'State',
    capital: 'Chennai',
    wards: ['Ward 15 (Nungambakkam, Chennai)', 'Ward 02 (Adyar, Chennai)', 'Ward 10 (Madurai Center)', 'Ward 05 (Coimbatore RS Puram)']
  },
  {
    name: 'Telangana',
    type: 'State',
    capital: 'Hyderabad',
    wards: ['Ward 01 (Hyderabad Gachibowli)', 'Ward 02 (Hyderabad Banjara Hills)', 'Ward 03 (Secunderabad)', 'Ward 04 (Warangal Central)']
  },
  {
    name: 'Tripura',
    type: 'State',
    capital: 'Agartala',
    wards: ['Ward 01 (Agartala Palace Ground)', 'Ward 02 (Dharmanagar)', 'Ward 03 (Udaipur Tripura)']
  },
  {
    name: 'Uttar Pradesh',
    type: 'State',
    capital: 'Lucknow',
    wards: ['Ward 01 (Lucknow Hazratganj)', 'Ward 02 (Noida Sector 62)', 'Ward 03 (Kanpur Swaroop Nagar)', 'Ward 04 (Varanasi Ghats)', 'Ward 05 (Agra Taj Ganj)']
  },
  {
    name: 'Uttarakhand',
    type: 'State',
    capital: 'Dehradun',
    wards: ['Ward 01 (Dehradun Rajpur Road)', 'Ward 02 (Haridwar Har Ki Pauri)', 'Ward 03 (Haldwani City)', 'Ward 04 (Nainital Mall Road)']
  },
  {
    name: 'West Bengal',
    type: 'State',
    capital: 'Kolkata',
    wards: ['Ward 03 (Salt Lake, Kolkata)', 'Ward 01 (Kolkata Park Street)', 'Ward 10 (Howrah Station)', 'Ward 05 (Darjeeling Mall Road)']
  },

  // 8 Union Territories
  {
    name: 'Andaman and Nicobar Islands',
    type: 'Union Territory',
    capital: 'Port Blair',
    wards: ['Ward 01 (Port Blair Aberdeen)', 'Ward 02 (Havelock Island)', 'Ward 03 (Campbell Bay)']
  },
  {
    name: 'Chandigarh',
    type: 'Union Territory',
    capital: 'Chandigarh',
    wards: ['Ward 15 (Sector 17, Chandigarh)', 'Ward 08 (Sector 35, Chandigarh)', 'Ward 22 (Sector 22, Chandigarh)']
  },
  {
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    type: 'Union Territory',
    capital: 'Daman',
    wards: ['Ward 01 (Daman Moti Daman)', 'Ward 02 (Diu Fort)', 'Ward 03 (Silvassa Center)']
  },
  {
    name: 'Delhi',
    type: 'Union Territory',
    capital: 'New Delhi',
    wards: ['Ward 08 (Connaught Place, New Delhi)', 'Ward 02 (Karol Bagh, New Delhi)', 'Ward 11 (Vasant Kunj, New Delhi)', 'Ward 05 (Dwarka, New Delhi)']
  },
  {
    name: 'Jammu and Kashmir',
    type: 'Union Territory',
    capital: 'Srinagar',
    wards: ['Ward 01 (Srinagar Lal Chowk)', 'Ward 02 (Jammu Gandhi Nagar)', 'Ward 03 (Anantnag)', 'Ward 04 (Leh Highway Road)']
  },
  {
    name: 'Ladakh',
    type: 'Union Territory',
    capital: 'Leh',
    wards: ['Ward 01 (Leh Main Bazaar)', 'Ward 02 (Kargil Town)']
  },
  {
    name: 'Lakshadweep',
    type: 'Union Territory',
    capital: 'Kavaratti',
    wards: ['Ward 01 (Kavaratti North)', 'Ward 02 (Minicoy)', 'Ward 03 (Agatti)']
  },
  {
    name: 'Puducherry',
    type: 'Union Territory',
    capital: 'Puducherry',
    wards: ['Ward 01 (Puducherry White Town)', 'Ward 02 (Auroville Road)', 'Ward 03 (Karaikal Central)']
  }
];
