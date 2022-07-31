<script>
	let paused = true;
	let volume = 1;
	let duration;
	let currentTime = 0;
	let ended;

	const countries = ["Ukraine", "Azerbaijan", "Germany"];
	const videos = ["static/12_points_from/germany.mp4", "static/12_points_from/ukraine.mp4"];
	let videoSrc = "";

	function changeSrc(){
		paused = !paused

		videos.forEach((video,i) => {
			videoSrc = video;
			setTimeout(() => {
				console.log("Next video")
			}, i*(duration / 60).toFixed(3)*10000)
		}) 
      		
    
		ended = true;

		if (ended == true){
			videoSrc = videos.pop(),
			console.log(videoSrc);
		}
	}

</script>

<video poster="static/esc_norway.jpg" src={videoSrc}
	bind:volume={volume}
	bind:paused={paused}
	bind:duration={duration}
	bind:currentTime={currentTime}
	bind:ended={ended}>

	
	<track kind="captions">
</video>

<p>
	{(currentTime/60).toFixed(2)} /
	{(duration / 60).toFixed(2)}
	{ended}
	{console.log((duration / 60).toFixed(3)*10000)}
</p>

<button class="button-2" on:click={() => changeSrc()}>
	{paused ? "12 points" : "Pause"}
</button>


<style>
	video {
		max-width: 500px;
		position: absolute;
		right: 75px;
		bottom: 450px;
	}

	.button-2 {

		display: inline-block;
		outline: 0;
		border:0;
		cursor: pointer;
		text-decoration: none;
		position: absolute;
		color: #000;
		background: rgb(238,174,202);;
		line-height: 30px;
		border-radius: 40px;
		padding: 20px;
		font-size: 30px;
		font-weight: 600;
		box-shadow: rgb(255, 198, 0) -2px -2px 0px 2px, rgb(246, 84, 174) 0px 0px 0px 4px, rgba(0, 0, 0, 0.05) 0px 0px 2px 7px;
		transition: all 0.2s;
		right: 120px;
  		bottom: 50px;
	}

	.button-2:hover {
		background-color: yellow;
		color: black;
	}

	button {
		position: absolute;
  		right: -300px;
  		bottom: -150px;
	}
</style>