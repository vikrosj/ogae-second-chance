<script>
import { writable } from "svelte/store";

	import {twelvePointsFromArray} from "./../voting/12-points-mini";
	$: pauseVideo = true;
	let played;
	let volume = 1;
	let duration;
	let currentTime = 0;
	let ended = false;
	let twelvePoints = [];

	twelvePointsFromArray.subscribe((data) => {
		twelvePoints = data;
	});

	const twelvePointsPath = "static/12_points_from/";
	const videos = [twelvePointsPath+"germany.mp4", twelvePointsPath+"ukraine.mp4", twelvePointsPath+"azerbaijan.mp4"];
	$: videoSrc = "";

	function changeSrc(){
		if (videos.length == 0){
			pauseVideo = true;
		}

		else {
			pauseVideo = false;
			videoSrc = videos.pop();
		}
	}

	document.addEventListener("ended", function() {
		console.log("The video has just ended!");
		changeSrc();
	}, true);

</script>

<button class="button-2" on:click={() => changeSrc()}>
	{pauseVideo ? "12 points" : "Pause"}
</button>

<video poster="static/esc_norway.jpg" src={videoSrc}
	bind:volume={volume}
	bind:paused={pauseVideo}
	bind:duration={duration}
	bind:currentTime={currentTime}
	bind:ended={ended}
	bind:played={played}
	autoplay>
	<track kind="captions">
</video>

<style>
	video {
		max-width: 500px;
		margin-top: -400px;
		float: left;
    	position: relative;
    	left: 70%;
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