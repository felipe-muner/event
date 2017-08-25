

if("true" === getParameterByName('manual', window.location.href )) {
  $(document).ready(function(e){
    var introGuide = introJs()
    introGuide.onexit(function(e){
      $('.nav.side-menu > li > a').css('color','#E7E7E7')
      $('#modalFind').modal('hide')
    }).onchange(function(targetElement) {
      console.log(targetElement)
      if('/find' === document.location.pathname &&
                      (
                        $(targetElement).data('step') === 3 ||
                        $(targetElement).data('step') === 4 ||
                        $(targetElement).data('step') === 5 ||
                        $(targetElement).data('step') === 6 ||
                        $(targetElement).data('step') === 7 ||
                        $(targetElement).data('step') === 8 ||
                        $(targetElement).data('step') === 9
                      )
      ) {
        $('#modalFind').modal('show')
      }else {
        $('#modalFind').modal('hide')
      }

      $('.nav.side-menu > li > a').css('color','#E7E7E7')
      $(".introjs-helperNumberLayer").css('top', '0px')
      $(".introjs-helperNumberLayer").css('left', '0px')
    }).oncomplete(function() {
      switch (document.location.pathname) {
        case '/menu-item':
          window.location.href = '/menu-item/edit/1?manual=true&multipage=true';
          break;
      }

    }).start()
  })
}
