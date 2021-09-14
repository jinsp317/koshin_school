$(".mobile-menu-icon-hp").click(function() {
	$(".menu-toggle-btn").toggleClass("open");
	$(this).toggleClass("open");
	if($(".menu-toggle-btn").hasClass("open") == true){
		$(".menu-text-hp").text("CLOSE");	
	}
	else
	{
		$(".menu-text-hp").text("MENU");	
	}
	$(".navigation").slideToggle();
	$(".overlay-mobile-menu-hp").fadeToggle();
});

$(".navbar-nav .nav-link").click(function() {
	var width = $(window).width();
	if(width < 992){
		$(".menu-toggle-btn").removeClass("open");
		$(this).removeClass("open");
		$(".navigation").slideUp();
		$(".overlay-mobile-menu-hp").fadeOut();
	}
});

$('#gototop'). click(function() {
	$('html, body'). animate({
		scrollTop: 0
	}, 1000);
});

$(window).scroll(function() {
    if ($(this).scrollTop()) {
        $('#gototop').fadeIn();
    } else {
        $('#gototop').fadeOut();
    }
});

$("#gototop").click(function () {
   //1 second of animation time
   //html works for FFX but not Chrome
   //body works for Chrome but not FFX
   //This strange selector seems to work universally
   $("html, body").animate({scrollTop: 0}, 1000);
});
