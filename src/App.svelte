<script>
	import { receivedPointsArray } from './../voting/received-points.js';
  import { pointFromArray } from './../voting/points-from';
	import { get } from 'svelte/store';
	import Navbar from "./Navbar.svelte";
  import countryFlagEmoji from "country-flag-emoji";
  import lodash from "lodash";


  const receivedPoints = get(receivedPointsArray);
  const pointFrom = get(pointFromArray);
  let country_code = [];
  let name = [];
  let points = [];

  function updatePoints(array) {
		array.forEach(el => {
		el.value ++;
		country_code.push(el.CountryCode);
    name.push(el.Name);
    points.push(lodash.sum(el.Points));
	})
	}

  function andThePointsGoTo(array){
    array.forEach(el => {
      el.value ++;
      console.log("Points from", el.Name);
      const object = el.Points
      for (const property in object) {
        console.log(`${object[property]} points go to ${property}`);

        points[name.indexOf(property)] = points[name.indexOf(property)] + object[property];
        console.log(points);
      }
    
    })
  }
  updatePoints(receivedPoints);
  andThePointsGoTo(pointFrom);
</script>

<Navbar />
<!-- <button on:click={() => receivedPointsArray.set({}) }>Set c to 4</button> -->
<table>
  <tbody>
    {#each country_code as c, i}
    <tr>
      <td>{countryFlagEmoji.get(country_code[i]).emoji}</td>
      <td>{name[i]}</td>
      <td>{points[i]}</td>
    </tr>
    {/each}
  </tbody>
</table>
<!-- <AddPlayer on:addplayer={addPlayer} /> -->

<style>
  table, td {
    border: 1px solid;
    border-collapse: collapse;
    margin: 10px;
  }
</style>