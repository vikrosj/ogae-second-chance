import { writable } from 'svelte/store';

export let studentsArray = writable([
    {
      "Rank" : 1,
      "Name" : "Norway",
      "Points" : 14
    },
    {
      "Rank" : 2,
      "Name" : "Sweden",
      "Points" : 13
    },
  ]);