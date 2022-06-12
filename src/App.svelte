<script>
  import Navbar from "./Navbar.svelte";
  import Player from "./Player.svelte";
  import AddPlayer from "./AddPlayer.svelte";
  import points from "../voting/points";
  import countryFlagEmoji from "country-flag-emoji";

  let players =  points;
  console.log(players);

   const addPlayer = e => {
     const newPlayer = e.detail;
  //   players = [...players, newPlayer];
  console.log(newPlayer);
  };

  console.log(countryFlagEmoji.data);
</script>

<Navbar />
<div class="container">
  <AddPlayer on:addplayer={addPlayer} />
  {#if players.length === 0}
    <p>No Players</p>
  {:else}
    {#each players as player}
      <Player
        flag={countryFlagEmoji.get(player.country_code).emoji}
        country={player.country}
        points={player.id}/>
    {/each}
  {/if}
</div>
