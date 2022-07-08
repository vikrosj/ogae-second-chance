<script>

import countryFlagEmoji from "country-flag-emoji";
import range from "../utils/range";
import { participantsArray } from './../voting/participants';

let participantsStore = [];

participantsArray.subscribe((data) => {

  participantsStore = data;

});
</script>

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

<style>
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
  padding: 8px;
  background: rgb(238,174,202);
  font-size: large;
  font-weight: bold;
}
</style>