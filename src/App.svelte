<script>
	import { participantsArray } from './../voting/participants';
  import { pointFromArray } from './../voting/points-from';
	import { get } from 'svelte/store';
	import Navbar from "./Navbar.svelte";
  import countryFlagEmoji from "country-flag-emoji";
  import range from "../utils/range";
  import initalizeParticipants from "../utils/initalizeParticipants"

  const participants = get(participantsArray);
  const pointFrom = get(pointFromArray);
  const votingLength = [...Array(pointFrom.length).keys()];

  let country_code = [];
  let name = [];
  let points = new Array(pointFrom.length).fill(0);
  let givesPoints = ""; 


  initalizeParticipants(participants, country_code, name);

  function andThePointsGoTo(array, index, name){
    const row = array[index];
    const object = row.Points;

    givesPoints = "Points from ".concat(row.Name);
    for (const property in object) {
      console.log(`${object[property]} points go to ${property}`);

      points[name.indexOf(property)] = points[name.indexOf(property)] + object[property];
    }

}
</script>

<Navbar />
<div class="row">
  <div class="column">
    <table>
        {#each Array.from({length: 10}, (_, i) => i + 1)  as i}
        <tr>
          <td> {countryFlagEmoji.get(country_code[i]).emoji}</td>
          <td>{name[i]}</td>
          <td>{points[i]}</td>
        </tr>
        {/each}
    </table>
  </div>
  <div class="column">
    <table>
        {#each range(11, 20) as i}
        <tr>
          <td> {countryFlagEmoji.get(country_code[i]).emoji}</td>
          <td>{name[i]}</td>
          <td>{points[i]}</td>
        </tr>
        {/each}
    </table>
  </div>
  <div class="column">
    <table>
        {#each range(21, 30) as i}
        <tr>
          <td> {countryFlagEmoji.get(country_code[i]).emoji}</td>
          <td>{name[i]}</td>
          <td>{points[i]}</td>
        </tr>
        {/each}
    </table>
  </div>
  <div class="column">
    <table>
        {#each range(31, 40) as i}
        <tr>
          <td> {countryFlagEmoji.get(country_code[i]).emoji}</td>
          <td>{name[i]}</td>
          <td>{points[i]}</td>
        </tr>
        {/each}
    </table>
  </div>
</div>

<div class="points-text">
  <p>{givesPoints}</p>
</div>

<div class="div-down">
  <button on:click={() => andThePointsGoTo(pointFrom, votingLength.pop(), name)}>Give points</button>
</div>


<style>
  
  * {
  box-sizing: border-box;
}

  :global(body){
    background-image: linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%);
  }

.row {
  margin-left:10px;
  margin-right:-20px;
}
  
.column {
  float: left;
  width: 20%;
  margin-top: 100px;
  margin-right: -75px;
}

/* Clearfix (clear floats) */
.row::after {
  content: "";
  clear: both;
  display: table;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
  width: 80%;
  border: 1px solid black;
  background-color: white;
}

td {
  text-align: left;
  border: 1px solid black;
  background-color: white;
  padding: 10px;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
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