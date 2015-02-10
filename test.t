require("prob")

local C = terralib.includecstring [[
#include "stdio.h"
#include "math.h"
]]

local gl = require("gl")


local radians = macro(function(deg)
	return `deg*[math.pi]/180.0
end)


local param = macro(function(opts)
	--
end)


local artprog = probcomp(function()
	-- Parameters are:
	--  * Concentration of the triangles around the circle (determines number of them)
	--  * Mean, stddev of radial distance of triangles to origin
	--  * Mean, stddev of triangle size
	--  * Mean, stddev of triangle aspect ratio
	--  * Mean, stddev of triangle orientation
	--  * Mean, stddev of triangle color
	--  * Mean, stddev of triangle opacity
	local concentration = `10.0
	local rad_mean = `125.0
	local rad_dev = `20.0
	local scale_mean = `10.0
	local scale_dev = `1.0
	local aspect_mean = `1.0
	local aspect_dev = `0.2
	local ang_mean = `radians(0.0)
	local ang_dev = `radians(10.0)
	local color_r_mean = `0.1
	local color_g_mean = `0.1
	local color_b_mean = `0.8
	local color_dev = `0.1
	local alpha_mean = `0.75
	local alpha_dev = `0.1

	-- TODO: The bounds do nothing when forward sampling. We should fix this, but for now maybe just switch to beta/gamma

	return terra()
		var numTris = poisson(concentration)
		for i=0,numTris do
			var radius = gaussian(rad_mean, rad_dev, {lowerBound=0.0})
			var scale = gaussian(scale_mean, scale_dev, {lowerBound=0.0})
			var aspect = gaussian(aspect_mean, aspect_dev, {lowerBound=0.05, upperBound=10.0})
			var ang = gaussian(ang_mean, ang_dev)
			var color_r = gaussian(color_r_mean, color_dev, {lowerBound=0.0, upperBound=1.0})
			var color_g = gaussian(color_g_mean, color_dev, {lowerBound=0.0, upperBound=1.0})
			var color_b = gaussian(color_b_mean, color_dev, {lowerBound=0.0, upperBound=1.0})
			var alpha = gaussian(alpha_mean, alpha_dev, {lowerBound=0.0, upperBound=1.0})
			gl.glColor4d(color_r, color_g, color_b, alpha)
			gl.glPushMatrix()
			var theta = (double(i)/numTris) * [2*math.pi]
			var tx = radius*C.cos(theta)
			var ty = radius*C.sin(theta)
			gl.glTranslated(tx, ty, 0.0)
			gl.glScaled(scale, scale, scale)
			gl.glScaled(aspect, 1.0, 1.0)
			gl.glRotated(ang, 0.0, 0.0, 1.0)
			gl.glBegin(gl.mGL_TRIANGLES())
				gl.glVertex2d(-0.5, -0.5)
				gl.glVertex2d(0.5, -0.5)
				gl.glVertex2d(0.0, 0.5)
			gl.glEnd()
			gl.glPopMatrix()
		end
	end
end)


---------------------------------


local terra redisplay()
	gl.glClearColor(1.0, 1.0, 1.0, 1.0)
	gl.glClear(gl.mGL_COLOR_BUFFER_BIT())
	gl.glMatrixMode(gl.mGL_MODELVIEW())
	gl.glLoadIdentity()
	[artprog()]()
	gl.glFlush()
end


-- Init GLUT
local imgsize = 500
local terra initGlut()
	var argc = 0
	gl.glutInit(&argc, nil)
	gl.glutInitWindowSize(imgsize, imgsize)
	gl.glutInitDisplayMode(gl.mGLUT_RGBA() or gl.mGLUT_SINGLE())
	gl.glutCreateWindow("Render")
	gl.glViewport(0, 0, imgsize, imgsize)

	gl.glMatrixMode(gl.mGL_PROJECTION())
	gl.glLoadIdentity()
	gl.gluOrtho2D(-imgsize/2, imgsize/2, -imgsize/2, imgsize/2)

	gl.glutDisplayFunc(redisplay)

	gl.glutMainLoop()

end
initGlut()




