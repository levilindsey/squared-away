// ------------------------------------------------------------------------- //
// -- window.PreviewWindow
// ------------------------------------------------------------------------- //
// For use with the Squared web app.
// 
// All of the PreviewWindow logic is encapsulated in this anonymous function.  
// This is then stored in the window.PreviewWindow property.  This has the 
// effect of minimizing side-effects and problems when linking multiple script 
// files.
// 
// Dependencies:
//		- window.Sprite
//		- window.utils
// ------------------------------------------------------------------------- //

(function() {
	function PreviewWindow() {
		// TODO: 
	};

	// --------------------------------------------------------------------- //
	// -- Public (non-privileged) members

	// PreviewWindow inherits from Sprite
	PreviewWindow.prototype = window.utils.object(Sprite);

	// Make PreviewWindow available to the rest of the program
	window.PreviewWindow = PreviewWindow;
})();
