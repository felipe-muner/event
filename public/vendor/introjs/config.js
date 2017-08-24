if("true" === getParameterByName('manual', window.location.href )) {
  var introGuide = introJs()

  introGuide.onexit(function(e){
    $('.nav.side-menu > li > a').css('color','#E7E7E7')
  }).onchange(function(targetElement) {
    $('.nav.side-menu > li > a').css('color','black')
    $(".introjs-helperNumberLayer").css('top', '0px')
    $(".introjs-helperNumberLayer").css('left', '0px')
  }).start()
}
