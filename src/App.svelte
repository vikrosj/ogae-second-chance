<script>
  import Navbar from "./Navbar.svelte";
  import Player from "./Player.svelte";
  import AddPlayer from "./AddPlayer.svelte";
  import points from "../voting/points";

  let players =  points;
  console.log(players);

   const addPlayer = e => {
     const newPlayer = e.detail;
  //   players = [...players, newPlayer];
  console.log(newPlayer);
  };

</script>

<Navbar />
<div class="container">
  <AddPlayer on:addplayer={addPlayer} />
  {#if players.length === 0}
    <p>No Players</p>
  {:else}
    {#each players as player}
      <Player
        country={player.country}
        points={player.id}/>
    {/each}
  {/if}
</div>
