import { writable } from 'svelte/store';

export let participantsArray = writable([
    {
        "Name" : "Norway",
        "Points" : [],
        "CountryCode" : "NO"
    },
    {
        "Name" : "Sweden",
        "Points" : [],
        "CountryCode": "SE"
    },
    {
        "Name" : "Denmark",
        "Points" : [],
        "CountryCode" : "DK"
    }
  ]);