import { writable } from 'svelte/store';

export let pointFromArray = writable([
  {
    "Name" : "Norway",
    "Points" : {"Sweden": 1, "Denmark": 10, "United Kingdom" : 8},
    "CountryCode" : "NO"
  },

  {
    "Name" : "Sweden",
    "Points" :  {"Norway": 1, "Denmark": 10, "United Kingdom" : 8},
    "CountryCode": "SE"
  },
  {
    "Name" : "Denmark",
    "Points" :  {"Norway": 10, "Sweden": 10, "United Kingdom" : 8},
    "CountryCode": "DK"
  },
  {
    "Name" : "United Kingdom",
    "Points" :  {"Norway": 10, "Sweden": 6, "Denmark" : 8},
    "CountryCode" : "GB"
  }
]

  );

  export default pointFromArray;