<script>
	import { participantsArray } from './../voting/participants';
  import { pointFromArray } from './../voting/points-from';
	import { get } from 'svelte/store';
	import Navbar from "./Navbar.svelte";
  import countryFlagEmoji from "country-flag-emoji";
  import lodash from "lodash";


  const participants = get(participantsArray);
  const pointFrom = get(pointFromArray);
  const votingLength = [...Array(pointFrom.length).keys()];
  let country_code = [];
  let name = [];
  let points = new Array(pointFrom.length).fill(0);
  let givesPoints = ""

  function initalizeParticipants(array) {
		array.forEach(el => {
		el.value ++;
		country_code.push(el.Alpha2Code);
    name.push(el.Name);
	})
	}

  initalizeParticipants(participants);

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

  console.log(participants, pointFrom, countryFlagEmoji.data);
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
  <div class="points-text">
    <p>Points from {givesPoints}</p>
  </div>
</div>
<div class="div-down">
  <button on:click={() => andThePointsGoTo(pointFrom, votingLength.pop()) }>Give points</button>
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

.points-text {
  position: absolute;
  right: 300px;
  bottom: 50px;;
}

.div-down {
  position: absolute;
  right: 100px;
  bottom: 50px;;
}
</style>