<script>
	import { receivedPointsArray } from './../voting/received-points.js';
	import { get } from 'svelte/store';
	import Navbar from "./Navbar.svelte";
  import countryFlagEmoji from "country-flag-emoji";
  import lodash from "lodash";


  const receivedPoints = get(receivedPointsArray);
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

  updatePoints(receivedPoints);
</script>

<Navbar />
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