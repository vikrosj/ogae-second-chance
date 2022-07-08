<script>
	let paused = true;
	let volume = 1;
	let duration;
	let currentTime = 0;
</script>
<div>

<video
poster="static/esc_norway.jpg"
src="static/12_points_from/germany.mp4"

bind:volume={volume}
bind:paused={paused}
bind:duration={duration}
bind:currentTime={currentTime}
>
	
	<track kind="captions">
</video>
<p>
	{(currentTime/60).toFixed(2)} /
	{(duration / 60).toFixed(2)}
	</p>
<button on:click={() => paused = !paused}>
	{paused ? "Play" : "Pause"}
</button>
</div>

<style>
	div {
		position: absolute;
		right: 0px;
		bottom: 200px;
	}
	video {
		max-width: 600px;
	}
</style>