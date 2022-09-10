import { writable } from 'svelte/store';

export const twelvePointsFromArray = writable([
  {
    Name : "Azerbaijan",
    PointsTo: {"United Kingdom": 12},
    Alpha2Code: "AL"
},
{
    Name : "Ukraine",
    PointsTo: {"United Kingdom": 12},
    Alpha2Code: "UA"
},
{
    Name : "Germany",
    PointsTo: {"United Kingdom": 12},
    Alpha2Code: "AZ"
}

]);