import { writable } from 'svelte/store';

export let pointFromArray = writable([
  {
    "Name" : "Norway",
    "Points" : {"Sweden": 1, "Denmark": 10},
    "CountryCode" : "NO"
  },

  {
    "Name" : "Sweden",
    "Points" :  {"Norway": 1, "Denmark": 10},
    "CountryCode": "SE"
  },
  {
    "Name" : "Denmark",
    "Points" :  {"Norway": 10, "Sweden": 10},
    "CountryCode": "DK"
  }
]

  );

  export default pointFromArray;