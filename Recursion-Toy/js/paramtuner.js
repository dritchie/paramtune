
// I'm using shared global state here. Yes, I know that makes me a bad boy.
// But it was the quickest way to get something up and running.

var Tuner = new function()
{
	var likedTraces = []
	var dislikedTraces = []
	var lastTrace = null

	var doRender = true
	var doProfile = false

	function generateTree() { generate({doRender: doRender, doProfile: doProfile}); }

	var paramProg = null
	function makeParamProg()
	{
		// Define the program
		paramProg = function paramProg()
		{
			// Needed to ensure that min parameters stay smaller than max parameters.
			// Is this always the right approach? If not, when is it not?
			function uniform_safe(lo, hi, isStructural)
			{
				return uniform(0,1,isStructural)*(hi-lo) + lo
			}

			// Sample values for parameters
			CONFIG.NUM_BRANCHES = 1 	// I've decided to keep this fixed, since it's annoying.
			CONFIG.BRANCH_PROBABILITY  = uniform_safe(0.01,1.0,false);
			CONFIG.MAX_CONCURRENT      = uniform_safe(10,1000,false);
			CONFIG.MIN_RADIUS          = uniform_safe(0.1,2.0,false);
			CONFIG.MAX_RADIUS          = uniform_safe(CONFIG.MIN_RADIUS,100,false);
			CONFIG.MIN_WANDER_STEP     = uniform_safe(0.1,PI,false);
			CONFIG.MAX_WANDER_STEP     = uniform_safe(CONFIG.MIN_WANDER_STEP,PI,false);
			CONFIG.MIN_GROWTH_RATE     = uniform_safe(0.1,20,false);
			CONFIG.MAX_GROWTH_RATE     = uniform_safe(CONFIG.MIN_GROWTH_RATE,20,false);
			CONFIG.MIN_SHRINK_RATE     = uniform_safe(0.9,0.999,false);
			CONFIG.MAX_SHRINK_RATE     = uniform_safe(CONFIG.MIN_SHRINK_RATE,0.999,false);
			CONFIG.MIN_DIVERGENCE      = uniform_safe(0.0,PI,false);
			CONFIG.MAX_DIVERGENCE      = uniform_safe(CONFIG.MIN_DIVERGENCE,PI,false);

			// var str = ""
			// for (var prop in CONFIG)
			// 	str += (prop + ": " + CONFIG[prop] + "\n")
			// alert(str)
 
			// Update all the liked/disliked traces, and add/subtract their logprobs
			// (But disable rendering so things go way faster)
			doRender = false;
			for (var i = 0; i < likedTraces.length; i++)
			{
				likedTraces[i].traceUpdate(true);
				// alert("logprob: " + likedTraces[i].logprob)
				// if (likedTraces[i].logprob != likedTraces[i].logprob) alert("NaN logprob!");
				factor(likedTraces[i].logprob);
			}
			for (var i = 0; i < dislikedTraces.length; i++)
			{
				dislikedTraces[i].traceUpdate(true);
				// alert("logprob: " + dislikedTraces[i].logprob)
				// if (dislikedTraces[i].logprob != dislikedTraces[i].logprob) alert("NaN logprob!");
				factor(-dislikedTraces[i].logprob);
			}
			doRender = true;

			// Copy curr params and return
			var params = {};
			for (var prop in CONFIG)
				params[prop] = CONFIG[prop];
			return params;
		}
	}

	return {
		likeThisTrace: function()
		{
			if (lastTrace) likedTraces.push(lastTrace);
		},

		dislikeThisTrace: function()
		{
			if (lastTrace) dislikedTraces.push(lastTrace);
		},

		clearLikes: function()
		{
			likedTraces = [];
			dislikedTraces = [];
		},

		suggest: function()
		{
			lastTrace = pr.newTrace(generateTree)
			// console.log(lastTrace.varlist.length)
		},

		tune: function()
		{
			if (!paramProg) makeParamProg();
			var mapParams = MAP(paramProg, traceMH, 1000, 1, true);

			for (var prop in mapParams)
				CONFIG[prop] = mapParams[prop];
			GUI.listenAll();
		}
	}
}






