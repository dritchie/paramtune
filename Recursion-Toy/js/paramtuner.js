
// I'm using shared global state here. Yes, I know that makes me a bad boy.
// But it was the quickest way to get something up and running.

var Tuner = new function()
{
	var likedTraces = []
	var lastTrace = null

	var doProfile = true

	function generateAndRender() { generate({doRender: true, doProfile: doProfile}) }
	function generateNoRender() { generate({doRender: false, doProfile: doProfile}) }

	return {
		likeThisTrace: function()
		{
			if (lastTrace) likedTraces.push(lastTrace)
		},

		clearLikes: function()
		{
			likedTraces = []
		},

		suggest: function()
		{
			lastTrace = pr.newTrace(generateAndRender, "rejection")
			lastTrace.traceUpdate(true)

			// generateAndRender()
		},

		tune: function()
		{
			//
		}
	}
}