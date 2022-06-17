<script>
	import { receivedPointsArray } from './../voting/received-points.js';
  import { pointFromArray } from './../voting/points-from';
	import { get } from 'svelte/store';
	import Navbar from "./Navbar.svelte";
  import countryFlagEmoji from "country-flag-emoji";
  import lodash from "lodash";


  const receivedPoints = get(receivedPointsArray);
  const pointFrom = get(pointFromArray);
  const votingLength = [...Array(pointFrom.length).keys()];
  let country_code = [];
  let name = [];
  let points = [];
  let givesPoints = ""

  function updatePoints(array) {
		array.forEach(el => {
		el.value ++;
		country_code.push(el.CountryCode);
    name.push(el.Name);
    points.push(lodash.sum(el.Points));
	})
	}

  function andThePointsGoTo(array, index){
      const row = array[index];

      givesPoints = row.Name;
      const object = row.Points
      for (const property in object) {
        console.log(`${object[property]} points go to ${property}`);

        points[name.indexOf(property)] = points[name.indexOf(property)] + object[property];
        console.log(points);
      }

  }
  
  updatePoints(receivedPoints);
</script>

<Navbar />
<div class="container">
  <div class="card">
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
  </div>
  <div class="card">
    <p>Points from {givesPoints}</p>
  </div>
  <div class="card">
    <button on:click={() => andThePointsGoTo(pointFrom, votingLength.pop()) }>Give points</button>
  </div>
</div>


<style>
  table, td {
    border: 1px solid;
    border-collapse: collapse;
    margin: 10px;
  }

  .container {
  column-width: 250px;
  column-gap: 20px;
}

.card {
  background-color: white;
  border: 2px solid white;
  padding: 10px;
  margin: 0 0 1em 0;
}


</style>