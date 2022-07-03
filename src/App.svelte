<script>
	import { participantsArray } from './../voting/participants';
  import { pointFromArray } from './../voting/points-from';
	import { get } from 'svelte/store';
	import Navbar from "./Navbar.svelte";
  import { countryFlagEmoji }from "country-flag-emoji";
  import range from "../utils/range";
  import { andThePointsGoTo } from "../utils/pointsHandler"

  const pointFrom = get(pointFromArray);
  const votingLength = [...Array(pointFrom.length).keys()];


  let participantsStore = [];
  
  participantsArray.subscribe((data) => {

    participantsStore = data;

  })

</script>

<Navbar />
<div class="row">
  <div class="column">
    <table>
        {#each Array.from({length: 10}, (_, i) => i + 1)  as i}
        <tr>
          <td> {countryFlagEmoji.get(participantsStore[i].Alpha2Code).emoji}</td>
          <td>{participantsStore[i].Name}</td>
          <td>{participantsStore[i].Points}</td>
        </tr>
        {/each}
    </table>
  </div>
  <div class="column">
    <table>
        {#each range(11, 20) as i}
        <tr>
          <td> {countryFlagEmoji.get(participantsStore[i].Alpha2Code).emoji}</td>
          <td>{participantsStore[i].Name}</td>
          <td>{participantsStore[i].Points}</td>
        </tr>
        {/each}
    </table>
  </div>
  <div class="column">
    <table>
        {#each range(21, 30) as i}
        <tr>
          <td> {countryFlagEmoji.get(participantsStore[i].Alpha2Code).emoji}</td>
          <td>{participantsStore[i].Name}</td>
          <td>{participantsStore[i].Points}</td>
        </tr>
        {/each}
    </table>
  </div>
  <div class="column">
    <table>
        {#each range(31, 40) as i}
        <tr>
          <td> {countryFlagEmoji.get(participantsStore[i].Alpha2Code).emoji}</td>
          <td>{participantsStore[i].Name}</td>
          <td>{participantsStore[i].Points}</td>
        </tr>
        {/each}
    </table>
  </div>
</div>

<div class="points-text">
  <p>{"later"}</p>
</div>

<div class="points-button">
  <button on:click={() => andThePointsGoTo(pointFrom, votingLength.pop())}>Give points</button>
</div>


<style>

  :global(body){
    background: rgb(63,94,251);
    background: radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%); 
    background-size: auto;
  }

.row {
  margin-left:10px;
  margin-right:-20px;
  margin-top: -100px;
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
}

td {
  text-align: left;
  border: 3px solid black;
  padding: 10px;
  background: rgb(238,174,202);
  font-size: large;
  font-weight: bold;
}

.points-text {
  position: absolute;
  right: 200px;
  bottom: 50px;;
}

.points-button {
  position: absolute;
  right: 100px;
  bottom: 50px;
}
</style>