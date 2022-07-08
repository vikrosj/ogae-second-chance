<script>
	let paused = true;
	let volume = 0;
	let duration;
	let currentTime = 0;
</script>
<div>

<video
poster="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

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
		right: 200px;
		bottom: 300px;
	}
	video {
		max-width: 400px;
	}
</style>