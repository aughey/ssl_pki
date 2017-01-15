$(function() {

  function on_switch_changed() {
    var s = $(this);
    var id = s.attr('x10id');
    var on_off = s.is(':checked') ? "on" : "off";
    var url = "/test/" + id + "/" + on_off;
    s.flipswitch('disable');
    $.get(url).then(function() {
      console.log("finished with " + url);
      s.flipswitch('enable');
    });
    console.log(url);
  }

function old() {
  s.find('input').bind('change',on_switch_change);
}


  var switches = [
  {
    name: "Family Room Light",
    x10id: 1
  }
  ,{
    name: "Espresso Machine",
    x10id: 3
  }
  ,{
    name: "Christmas Tree",
    x10id: 8
  }
  ];
  
setup_switches();

  function setup_switches() {
  console.log("Setup");
  var s = $('#switches');
  var li = $(s.find('li')[0]);
  s.html("");
  var id=0;
  switches.forEach(function(sw) {
    var name='flip-checkbox-' + id;
    var liclone = li.clone();
    liclone.find('label').html(sw.name).attr('for',name);
    var input = liclone.find('input');
    input.attr('x10id',sw.x10id).attr('name',name).attr('id',name).flipswitch().flipswitch('disable');
    s.append(liclone);
    $.getJSON("/state/" + sw.x10id).then(function(res) {
console.log(res);
      input.attr('checked',res.state).flipswitch('enable').flipswitch('refresh');
      input.bind('change',on_switch_changed);
    });
    ++id;
  });
  s.change();
  }
})
