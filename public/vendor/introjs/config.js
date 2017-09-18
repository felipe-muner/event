

if("true" === getParameterByName('manual', window.location.href )) {
  $(document).ready(function(e){
    var introGuide = introJs()
    introGuide.onexit(function(e){
      $('.nav.side-menu > li > a').css('color','#E7E7E7')
      $('#modalFind').modal('hide')
      $('#modalNewEvent').modal('hide')
      $('#modalNewEventExternal').modal('hide')

    }).onchange(function(targetElement) {

      if('/internal-event' === document.location.pathname && $(targetElement).data('step') > 2){
        setTimeout(function(){ $('#submitFormNewEvent').prop("disabled", true) }, 1)
        $('#modalNewEvent').modal('show')
      }else {
        debugger
        $('#submitFormNewEvent').prop("disabled", false)
        $('#modalNewEvent').modal('hide')
      }

      if('/external-event' === document.location.pathname && $(targetElement).data('step') > 5){
        setTimeout(function(){ $('#submitFormNewEvent').prop("disabled", true) }, 1)
        $('#modalNewEventExternal').modal('show')
      }else {
        debugger
        $('#submitFormNewEvent').prop("disabled", false)
        $('#modalNewEventExternal').modal('hide')
      }

      if('/find' === document.location.pathname && $(targetElement).data('step') > 2){
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
