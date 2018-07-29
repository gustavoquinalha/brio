var referenceElement = document.querySelector('.popover-text');
var popperElement = document.querySelector('.popover-profile');


// BUG: 
document.getElementById("popper-trigger").onclick = function(){
  var popper = new Popper(referenceElement, popperElement, {
    placement: 'top', // or bottom, left, right, and variations
    trigger: "click",
  });
  popperElement.classList.toggle("active");
}

var popper = new Popper(referenceElement, popperElement, {
  placement: 'top',
  trigger: "click"
});

var tooltip = new Tooltip(referenceElement, {
  placement: 'top',
  trigger: "click"
});
