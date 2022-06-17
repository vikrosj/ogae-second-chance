import { writable } from 'svelte/store';

export let studentsArray = writable([
    {
      "Rank" : 1,
      "Name" : "Norway",
      "Points" : 14,
      "CountryCode" : "NO"
    },
    {
      "Rank" : 2,
      "Name" : "Sweden",
      "Points" : 13,
      "CountryCode": "SE"
    },
  ]);