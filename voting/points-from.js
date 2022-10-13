import { writable } from 'svelte/store';

export const pointFromArray = writable([
   {
    Name: "Guest-jury",
    Points: {'Sweden': 116, 'Italy': 104, 'Finland': 103, 'Spain': 81, 'France': 69, 'Albania': 54, 'Ukraine': 53, 'Australia': 32, 'Serbia': 32, 'Norway': 29, 'Czech Republic': 20, 'Lithuania': 18, 'Estonia': 11, 'Croatia': 10, 'Ireland': 4, 'Poland': 6, 'Portugal': 9, 'Israel': 6, 'North Macedonia': 13, 'Germany': 5, 'Denmark': 7, 'Latvia': 12, 'Iceland': 14, 'Slovenia': 1, 'ROW': 0, 'Malta': 3, 'Romania': 0},
    Alpha2Code: "guestEmoji",
   },    
  {
    Name: "ROW",
    Points : {'Sweden': 7.0, 'Finland': 0.0, 'Spain': 10.0, 'Italy': 6.0, 'France': 0.0, 'Ukraine': 5.0, 'Albania': 3.0, 'Norway': 4.0, 'Australia': 8.0, 'Estonia': 0.0, 'Serbia': 0.0, 'Lithuania': 0.0, 'Croatia': 0.0, 'Czech Republic': 0.0, 'Ireland': 2.0, 'Poland': 0.0, 'Portugal': 0.0, 'Israel': 0.0, 'North Macedonia': 0.0, 'Germany': 0.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 1.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "AM"
  },
  {
    Name : "Albania",
    Points: {'Sweden': 6.0, 'Finland': 0.0, 'Spain': 10.0, 'Italy': 0.0, 'France': 0.0, 'Ukraine': 3.0, 'Albania': 0.0, 'Norway': 0.0, 'Australia': 0.0, 'Estonia': 0.0, 'Serbia': 1.0, 'Lithuania': 7.0, 'Croatia': 8.0, 'Czech Republic': 0.0, 'Ireland': 4.0, 'Poland': 0.0, 'Portugal': 0.0, 'Israel': 2.0, 'North Macedonia': 0.0, 'Germany': 5.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "AL"
},
{
    Name: "Australia",
    Points: {'Sweden': 6.0, 'Finland': 0.0, 'Spain': 10.0, 'Italy': 8.0, 'France': 7.0, 'Ukraine': 4.0, 'Albania': 3.0, 'Norway': 0.0, 'Australia': 0.0, 'Estonia': 0.0, 'Serbia': 1.0, 'Lithuania': 5.0, 'Croatia': 0.0, 'Czech Republic': 0.0, 'Ireland': 0.0, 'Poland': 0.0, 'Portugal': 0.0, 'Israel': 0.0, 'North Macedonia': 2.0, 'Germany': 0.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "AU"
},
{
    Name: "Croatia",
    Points: {'Sweden': 7.0, 'Finland': 0.0, 'Spain': 6.0, 'Italy': 5.0, 'France': 0.0, 'Ukraine': 0.0, 'Albania': 8.0, 'Norway': 3.0, 'Australia': 0.0, 'Estonia': 0.0, 'Serbia': 10.0, 'Lithuania': 0.0, 'Croatia': 0.0, 'Czech Republic': 0.0, 'Ireland': 0.0, 'Poland': 0.0, 'Portugal': 0.0, 'Israel': 4.0, 'North Macedonia': 1.0, 'Germany': 0.0, 'Denmark': 2.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "HR"
},
{
    Name: "Czech Republic",
    Points: {'Sweden': 0.0, 'Finland': 10.0, 'Spain': 0.0, 'Italy': 5.0, 'France': 0.0, 'Ukraine': 8.0, 'Albania': 7.0, 'Norway': 6.0, 'Australia': 0.0, 'Estonia': 0.0, 'Serbia': 4.0, 'Lithuania': 0.0, 'Croatia': 0.0, 'Czech Republic': 0.0, 'Ireland': 0.0, 'Poland': 1.0, 'Portugal': 3.0, 'Israel': 0.0, 'North Macedonia': 0.0, 'Germany': 2.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "CZ"
},
{
    Name: "Denmark",
    Points: {'Sweden': 7.0, 'Finland': 1.0, 'Spain': 0.0, 'Italy': 0.0, 'France': 10.0, 'Ukraine': 8.0, 'Albania': 0.0, 'Norway': 6.0, 'Australia': 0.0, 'Estonia': 0.0, 'Serbia': 0.0, 'Lithuania': 0.0, 'Croatia': 0.0, 'Czech Republic': 5.0, 'Ireland': 4.0, 'Poland': 0.0, 'Portugal': 3.0, 'Israel': 0.0, 'North Macedonia': 0.0, 'Germany': 0.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 2.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "DK"
},
{
    Name: "Estonia",
    Points: {'Sweden': 7.0, 'Finland': 0.0, 'Spain': 2.0, 'Italy': 3.0, 'France': 8.0, 'Ukraine': 6.0, 'Albania': 0.0, 'Norway': 10.0, 'Australia': 4.0, 'Estonia': 0.0, 'Serbia': 0.0, 'Lithuania': 5.0, 'Croatia': 0.0, 'Czech Republic': 0.0, 'Ireland': 0.0, 'Poland': 0.0, 'Portugal': 0.0, 'Israel': 1.0, 'North Macedonia': 0.0, 'Germany': 0.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "EE"
},
{
    Name: "Finland",
    Points: {'Sweden': 10.0, 'Finland': 0.0, 'Spain': 7.0, 'Italy': 8.0, 'France': 0.0, 'Ukraine': 6.0, 'Albania': 2.0, 'Norway': 0.0, 'Australia': 4.0, 'Estonia': 3.0, 'Serbia': 0.0, 'Lithuania': 5.0, 'Croatia': 0.0, 'Czech Republic': 0.0, 'Ireland': 1.0, 'Poland': 0.0, 'Portugal': 0.0, 'Israel': 0.0, 'North Macedonia': 0.0, 'Germany': 0.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "FI"
},
{
    Name: "France",
    Points: {'Sweden': 10.0, 'Finland': 6.0, 'Spain': 0.0, 'Italy': 5.0, 'France': 0.0, 'Ukraine': 3.0, 'Albania': 0.0, 'Norway': 8.0, 'Australia': 7.0, 'Estonia': 0.0, 'Serbia': 0.0, 'Lithuania': 0.0, 'Croatia': 2.0, 'Czech Republic': 0.0, 'Ireland': 1.0, 'Poland': 0.0, 'Portugal': 4.0, 'Israel': 0.0, 'North Macedonia': 0.0, 'Germany': 0.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "FR"
},
{
    Name: "Germany",
    Points: {'Sweden': 8.0, 'Finland': 0.0, 'Spain': 5.0, 'Italy': 0.0, 'France': 10.0, 'Ukraine': 2.0, 'Albania': 7.0, 'Norway': 6.0, 'Australia': 0.0, 'Estonia': 3.0, 'Serbia': 0.0, 'Lithuania': 0.0, 'Croatia': 4.0, 'Czech Republic': 0.0, 'Ireland': 1.0, 'Poland': 0.0, 'Portugal': 0.0, 'Israel': 0.0, 'North Macedonia': 0.0, 'Germany': 0.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "DE"
},
{
    Name: "Iceland",
    Points: {'Sweden': 10.0, 'Finland': 0.0, 'Spain': 6.0, 'Italy': 8.0, 'France': 5.0, 'Ukraine': 2.0, 'Albania': 0.0, 'Norway': 3.0, 'Australia': 7.0, 'Estonia': 0.0, 'Serbia': 0.0, 'Lithuania': 0.0, 'Croatia': 0.0, 'Czech Republic': 0.0, 'Ireland': 1.0, 'Poland': 0.0, 'Portugal': 0.0, 'Israel': 0.0, 'North Macedonia': 0.0, 'Germany': 0.0, 'Denmark': 4.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "IS"
},
{
    Name: "Ireland",
    Points: {'Sweden': 8.0, 'Finland': 3.0, 'Spain': 0.0, 'Italy': 10.0, 'France': 0.0, 'Ukraine': 6.0, 'Albania': 0.0, 'Norway': 5.0, 'Australia': 4.0, 'Estonia': 7.0, 'Serbia': 0.0, 'Lithuania': 0.0, 'Croatia': 0.0, 'Czech Republic': 1.0, 'Ireland': 0.0, 'Poland': 0.0, 'Portugal': 0.0, 'Israel': 2.0, 'North Macedonia': 0.0, 'Germany': 0.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "IE"
},
{
    Name: "Israel",
    Points: {'Sweden': 8.0, 'Finland': 10.0, 'Spain': 7.0, 'Italy': 6.0, 'France': 0.0, 'Ukraine': 0.0, 'Albania': 0.0, 'Norway': 2.0, 'Australia': 3.0, 'Estonia': 5.0, 'Serbia': 1.0, 'Lithuania': 0.0, 'Croatia': 0.0, 'Czech Republic': 0.0, 'Ireland': 0.0, 'Poland': 4.0, 'Portugal': 0.0, 'Israel': 0.0, 'North Macedonia': 0.0, 'Germany': 0.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "IL"
},
{
    Name: "Italy",
    Points: {'Sweden': 6.0, 'Finland': 7.0, 'Spain': 8.0, 'Italy': 0.0, 'France': 0.0, 'Ukraine': 4.0, 'Albania': 10.0, 'Norway': 1.0, 'Australia': 0.0, 'Estonia': 0.0, 'Serbia': 0.0, 'Lithuania': 0.0, 'Croatia': 0.0, 'Czech Republic': 0.0, 'Ireland': 5.0, 'Poland': 0.0, 'Portugal': 2.0, 'Israel': 0.0, 'North Macedonia': 0.0, 'Germany': 0.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 3.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "IT"
},
{
    Name: "Latvia",
    Points: {'Sweden': 6.0, 'Finland': 0.0, 'Spain': 2.0, 'Italy': 0.0, 'France': 3.0, 'Ukraine': 8.0, 'Albania': 0.0, 'Norway': 10.0, 'Australia': 5.0, 'Estonia': 0.0, 'Serbia': 1.0, 'Lithuania': 0.0, 'Croatia': 0.0, 'Czech Republic': 0.0, 'Ireland': 4.0, 'Poland': 7.0, 'Portugal': 0.0, 'Israel': 0.0, 'North Macedonia': 0.0, 'Germany': 0.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "LV"
},
{
    Name: "Lithuania",
    Points: {'Sweden': 7.0, 'Finland': 0.0, 'Spain': 8.0, 'Italy': 5.0, 'France': 1.0, 'Ukraine': 0.0, 'Albania': 0.0, 'Norway': 0.0, 'Australia': 0.0, 'Estonia': 0.0, 'Serbia': 6.0, 'Lithuania': 0.0, 'Croatia': 0.0, 'Czech Republic': 10.0, 'Ireland': 0.0, 'Poland': 0.0, 'Portugal': 4.0, 'Israel': 0.0, 'North Macedonia': 0.0, 'Germany': 3.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 2.0},
    Alpha2Code: "LT"
},
{
    Name: "Malta",
    Points: {'Sweden': 0.0, 'Finland': 1.0, 'Spain': 7.0, 'Italy': 10.0, 'France': 0.0, 'Ukraine': 5.0, 'Albania': 6.0, 'Norway': 4.0, 'Australia': 0.0, 'Estonia': 8.0, 'Serbia': 0.0, 'Lithuania': 0.0, 'Croatia': 0.0, 'Czech Republic': 0.0, 'Ireland': 3.0, 'Poland': 0.0, 'Portugal': 0.0, 'Israel': 2.0, 'North Macedonia': 0.0, 'Germany': 0.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "MT"
},
{
    Name: "North Macedonia",
    Points: {'Sweden': 8.0, 'Finland': 1.0, 'Spain': 0.0, 'Italy': 5.0, 'France': 6.0, 'Ukraine': 7.0, 'Albania': 0.0, 'Norway': 10.0, 'Australia': 0.0, 'Estonia': 0.0, 'Serbia': 0.0, 'Lithuania': 0.0, 'Croatia': 3.0, 'Czech Republic': 0.0, 'Ireland': 0.0, 'Poland': 4.0, 'Portugal': 0.0, 'Israel': 0.0, 'North Macedonia': 0.0, 'Germany': 0.0, 'Denmark': 0.0, 'Latvia': 2.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "MK"
},
{
    Name: "Norway",
    Points: {'Sweden': 10.0, 'Finland': 0.0, 'Spain': 7.0, 'Italy': 0.0, 'France': 8.0, 'Ukraine': 2.0, 'Albania': 6.0, 'Norway': 0.0, 'Australia': 5.0, 'Estonia': 3.0, 'Serbia': 0.0, 'Lithuania': 0.0, 'Croatia': 0.0, 'Czech Republic': 0.0, 'Ireland': 4.0, 'Poland': 0.0, 'Portugal': 0.0, 'Israel': 0.0, 'North Macedonia': 0.0, 'Germany': 0.0, 'Denmark': 1.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "NO"
},
{
    Name: "Poland",
    Points: {'Sweden': 4.0, 'Finland': 8.0, 'Spain': 0.0, 'Italy': 7.0, 'France': 5.0, 'Ukraine': 2.0, 'Albania': 10.0, 'Norway': 0.0, 'Australia': 6.0, 'Estonia': 0.0, 'Serbia': 1.0, 'Lithuania': 3.0, 'Croatia': 0.0, 'Czech Republic': 0.0, 'Ireland': 0.0, 'Poland': 0.0, 'Portugal': 0.0, 'Israel': 0.0, 'North Macedonia': 0.0, 'Germany': 0.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "PL"
},
{
    Name: "Portugal",
    Points: {'Sweden': 7.0, 'Finland': 6.0, 'Spain': 0.0, 'Italy': 10.0, 'France': 8.0, 'Ukraine': 4.0, 'Albania': 3.0, 'Norway': 2.0, 'Australia': 5.0, 'Estonia': 0.0, 'Serbia': 1.0, 'Lithuania': 0.0, 'Croatia': 0.0, 'Czech Republic': 0.0, 'Ireland': 0.0, 'Poland': 0.0, 'Portugal': 0.0, 'Israel': 0.0, 'North Macedonia': 0.0, 'Germany': 0.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "PT"
},
{
    Name: "Romania",
    Points: {'Sweden': 0.0, 'Finland': 1.0, 'Spain': 0.0, 'Italy': 8.0, 'France': 5.0, 'Ukraine': 0.0, 'Albania': 7.0, 'Norway': 2.0, 'Australia': 4.0, 'Estonia': 0.0, 'Serbia': 0.0, 'Lithuania': 0.0, 'Croatia': 3.0, 'Czech Republic': 0.0, 'Ireland': 0.0, 'Poland': 0.0, 'Portugal': 0.0, 'Israel': 10.0, 'North Macedonia': 0.0, 'Germany': 0.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 6.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "RO"
},
{
    Name: "Serbia",
    Points: {'Sweden': 2.0, 'Finland': 7.0, 'Spain': 8.0, 'Italy': 10.0, 'France': 3.0, 'Ukraine': 5.0, 'Albania': 0.0, 'Norway': 0.0, 'Australia': 0.0, 'Estonia': 0.0, 'Serbia': 0.0, 'Lithuania': 0.0, 'Croatia': 4.0, 'Czech Republic': 0.0, 'Ireland': 1.0, 'Poland': 0.0, 'Portugal': 0.0, 'Israel': 0.0, 'North Macedonia': 6.0, 'Germany': 0.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "RS"
},
{
    Name: "Slovenia",
    Points: {'Sweden': 8.0, 'Finland': 5.0, 'Spain': 6.0, 'Italy': 1.0, 'France': 0.0, 'Ukraine': 10.0, 'Albania': 0.0, 'Norway': 0.0, 'Australia': 2.0, 'Estonia': 4.0, 'Serbia': 0.0, 'Lithuania': 7.0, 'Croatia': 0.0, 'Czech Republic': 0.0, 'Ireland': 0.0, 'Poland': 0.0, 'Portugal': 0.0, 'Israel': 0.0, 'North Macedonia': 0.0, 'Germany': 3.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "SI"
},
{
    Name: "Spain",
    Points: {'Sweden': 0.0, 'Finland': 8.0, 'Spain': 0.0, 'Italy': 10.0, 'France': 7.0, 'Ukraine': 6.0, 'Albania': 4.0, 'Norway': 2.0, 'Australia': 1.0, 'Estonia': 3.0, 'Serbia': 0.0, 'Lithuania': 0.0, 'Croatia': 0.0, 'Czech Republic': 0.0, 'Ireland': 0.0, 'Poland': 0.0, 'Portugal': 5.0, 'Israel': 0.0, 'North Macedonia': 0.0, 'Germany': 0.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "ES"
},
{
    Name: "Sweden",
    Points: {'Sweden': 0.0, 'Finland': 10.0, 'Spain': 8.0, 'Italy': 5.0, 'France': 7.0, 'Ukraine': 3.0, 'Albania': 0.0, 'Norway': 6.0, 'Australia': 2.0, 'Estonia': 0.0, 'Serbia': 0.0, 'Lithuania': 0.0, 'Croatia': 0.0, 'Czech Republic': 0.0, 'Ireland': 4.0, 'Poland': 0.0, 'Portugal': 0.0, 'Israel': 0.0, 'North Macedonia': 0.0, 'Germany': 0.0, 'Denmark': 1.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "SE"
},
{
    Name: 'Ukraine', 
    Points: {'Sweden': 0.0, 'Finland': 10.0, 'Spain': 7.0, 'Italy': 1.0, 'France': 3.0, 'Ukraine': 0.0, 'Albania': 0.0, 'Norway': 5.0, 'Australia': 0.0, 'Estonia': 4.0, 'Serbia': 0.0, 'Lithuania': 6.0, 'Croatia': 2.0, 'Czech Republic': 8.0, 'Ireland': 0.0, 'Poland': 0.0, 'Portugal': 0.0, 'Israel': 0.0, 'North Macedonia': 0.0, 'Germany': 0.0, 'Denmark': 0.0, 'Latvia': 0.0, 'Iceland': 0.0, 'Slovenia': 0.0, 'ROW': 0.0, 'Malta': 0.0, 'Romania': 0.0},
    Alpha2Code: "UA"
}
]

  );

  export default pointFromArray;
