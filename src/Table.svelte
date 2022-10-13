<script>

import countryFlagEmoji from "country-flag-emoji";
import range from "../utils/range";
import { participantsArray } from './../voting/participants';
import { rowEmoji } from "../utils/variables";

let participantsStore = [];

function emoji(name, i){
  console.log(name);
  if (participantsStore[i].Name == "ROW"){
    return rowEmoji;
  }
  else {
    return countryFlagEmoji.get(participantsStore[i].Alpha2Code).emoji;
  }
}

participantsArray.subscribe((data) => {

  participantsStore = data;

});
</script>

<div class="row">
    <div class="column">
      <table>
        {#each range(0, 10) as i}
          <tr>
            <td> {emoji(participantsStore[i].Name, i)}</td>
            <td>{participantsStore[i].Name}</td>
            <td>{participantsStore[i].Points}</td>
          </tr>
          {/each}
      </table>
    </div>
    <div class="column">
      <table>
          {#each range(11, 21) as i}
          <tr>
            <td> {emoji(participantsStore[i].Name, i)}</td>
            <td>{participantsStore[i].Name}</td>
            <td>{participantsStore[i].Points}</td>
          </tr>
          {/each}
      </table>
    </div>
    <div class="column">
      <table>
          {#each range(22, 32) as i}
          <tr>
            <td> {emoji(participantsStore[i].Name, i)}</td>
            <td>{participantsStore[i].Name}</td>
            <td>{participantsStore[i].Points}</td>
          </tr>
          {/each}
      </table>
    </div>
  </div>

<style>
    .row {
  margin-left:20px;
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