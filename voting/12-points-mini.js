import { writable } from 'svelte/store';

export const twelvePointsFromArray = writable([
  {
    Name : "Azerbaijan",
    PointsTo: "United Kingdom",
    Alpha2Code: "AL"
},
{
    Name : "Ukraine",
    PointsTo: "United Kingdom",
    Alpha2Code: "UA"
},
{
    Name : "Germany",
    PointsTo: "United Kingdom",
    Alpha2Code: "AZ"
}

]);